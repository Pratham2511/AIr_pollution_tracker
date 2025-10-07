const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');
const { sequelize, City, PollutionReading } = require('./models');

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set! Using default (INSECURE for production)');
  process.env.JWT_SECRET = 'default-jwt-secret-please-change-in-production';
} else {
  console.log('✅ JWT_SECRET is configured');
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  WARNING: DATABASE_URL not set! Using local database configuration');
} else {
  console.log('✅ DATABASE_URL is configured');
}

console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

const app = express();

// Trust proxy for production deployment (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Performance middleware (order matters!)
app.use(compression()); // Enable gzip compression
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

// CORS configuration – allow Render frontend and local development
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const renderExternalUrl = process.env.RENDER_EXTERNAL_URL
  ? process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')
  : null;

const normalizeOrigin = (origin) => origin.replace(/\/$/, '');
const allowedOriginsSet = new Set(defaultOrigins.map(normalizeOrigin));

configuredOrigins
  .map(normalizeOrigin)
  .forEach(origin => allowedOriginsSet.add(origin));

if (renderExternalUrl) {
  allowedOriginsSet.add(renderExternalUrl);
}

const allowedOrigins = Array.from(allowedOriginsSet);

console.log('🔐 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOriginsSet.has(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`❌ Blocked CORS origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed by CORS policy' });
  }
  return next(err);
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const pollutionRoutes = require('./routes/pollutionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const otpRoutes = require('./routes/otpRoutes');

// Health check - respond even if database is not connected
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
        database: sequelize.connectionManager.getConnection ? 'connected' : 'connecting'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pollution', pollutionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', otpRoutes);

// Legacy routes for backward compatibility - redirect to pollution routes
app.get('/api/cities/count', async (req, res) => {
  try {
    const count = await City.count();
    res.json({ count });
  } catch (error) {
    console.error('Error getting city count:', error);
    res.json({ count: 0 });
  }
});

app.get('/api/cities', async (req, res) => {
  try {
    const cities = await City.findAll({
      attributes: ['id', 'name', 'slug', 'country', 'region', 'latitude', 'longitude', 'isIndian'],
      order: [['name', 'ASC']],
      limit: 500
    });
    res.json({
      count: cities.length,
      cities
    });
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({ message: 'Error fetching cities' });
  }
});

// Refresh data endpoint
app.post('/api/refresh-data', async (req, res) => {
  try {
    if (sequelize.getDialect() === 'postgres') {
      try {
        await sequelize.query('SELECT refresh_city_pollution_analytics()');
      } catch (refreshError) {
        console.warn('Analytics refresh function unavailable:', refreshError.message);
      }
    }

    res.json({ message: 'Data refreshed successfully', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing data' });
  }
});

// Guest API for random city data
app.get('/api/guest/random-city', async (req, res) => {
  try {
    const city = await City.findOne({
      order: sequelize.random()
    });

    if (!city) {
      return res.status(404).json({ success: false, message: 'No cities available' });
    }

    const latestReading = await PollutionReading.findOne({
      where: { cityId: city.id },
      order: [['recordedAt', 'DESC']]
    });

    res.json({
      success: true,
      city: {
        id: city.id,
        name: city.name,
        slug: city.slug,
        latitude: city.latitude,
        longitude: city.longitude,
        aqi: latestReading?.aqi || null,
        pm25: latestReading?.pm25 || null,
        pm10: latestReading?.pm10 || null
      }
    });
  } catch (error) {
    console.error('Error fetching guest city:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error loading city data' 
    });
  }
});

// Route handlers for frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Serve static files from public directory (without index.html)
app.use(express.static(path.join(__dirname, 'public'), { 
  index: false,
  setHeaders: (res, path) => {
    // Prevent caching for HTML files
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

let server;
let keepAliveInterval;
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (!server) {
    return;
  }

  if (isShuttingDown) {
    console.log('Already shutting down...');
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);

  const closeServer = () => new Promise((resolve) => {
    server.close(() => {
      console.log('HTTP server closed');
      resolve();
    });
  });

  setTimeout(async () => {
    try {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }

      await closeServer();
      await sequelize.close();
      console.log('Database connection closed');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
  }, 5000);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit on uncaught exceptions in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit on unhandled rejections in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Database connection with retry logic
let dbConnected = false;
async function connectDatabase() {
  if (dbConnected) return;
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database - use alter in production to fix schema issues
    const syncOptions = {
      force: false,
      alter: process.env.FORCE_DB_SYNC === 'true' ? true : false
    };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Database synchronized.');
    
    // Fix id sequences for PostgreSQL tables
    if (process.env.DATABASE_URL && sequelize.options.dialect === 'postgres') {
      try {
        console.log('🔧 Checking table structure and fixing sequences...');
        
        // Check if tables exist and their column types
        const [tables] = await sequelize.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'pollution_readings', 'tracked_cities')
        `);
        
        if (tables.length === 0) {
          console.log('⚠️  Tables not found, they will be created by Sequelize');
        } else {
          console.log(`📊 Found ${tables.length} tables, checking structure...`);
          
          // Check users table id column type
          const [usersCols] = await sequelize.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'id'
          `);
          
          if (usersCols.length > 0) {
            const idCol = usersCols[0];
            console.log(`📋 Users table id column: ${idCol.data_type}, default: ${idCol.column_default || 'none'}`);
            
            // If id is UUID or has no default, we need to fix it
            if (idCol.data_type === 'uuid' || !idCol.column_default) {
              console.log('🚨 Detected incorrect id column type or missing sequence!');
              console.log('🔧 Fixing table structure...');
              
              // Drop and recreate tables with correct schema
              await sequelize.query('DROP TABLE IF EXISTS "tracked_cities" CASCADE');
              await sequelize.query('DROP TABLE IF EXISTS "pollution_readings" CASCADE');
              await sequelize.query('DROP TABLE IF EXISTS "users" CASCADE');
              
              console.log('✅ Old tables dropped');
              
              // Recreate tables with correct schema
              await sequelize.sync({ force: false, alter: false });
              console.log('✅ Tables recreated with correct schema');
            } else if (idCol.data_type === 'integer') {
              // Integer type is correct, just ensure sequence exists
              await sequelize.query(`
                DO $$
                BEGIN
                  IF NOT EXISTS (SELECT 0 FROM pg_class WHERE relname = 'users_id_seq') THEN
                    CREATE SEQUENCE users_id_seq;
                    ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
                    ALTER SEQUENCE users_id_seq OWNED BY users.id;
                    PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
                  END IF;
                END $$;
              `);
              
              await sequelize.query(`
                DO $$
                BEGIN
                  IF NOT EXISTS (SELECT 0 FROM pg_class WHERE relname = 'pollution_readings_id_seq') THEN
                    CREATE SEQUENCE pollution_readings_id_seq;
                    ALTER TABLE pollution_readings ALTER COLUMN id SET DEFAULT nextval('pollution_readings_id_seq');
                    ALTER SEQUENCE pollution_readings_id_seq OWNED BY pollution_readings.id;
                    PERFORM setval('pollution_readings_id_seq', COALESCE((SELECT MAX(id) FROM pollution_readings), 0) + 1, false);
                  END IF;
                END $$;
              `);
              
              await sequelize.query(`
                DO $$
                BEGIN
                  IF NOT EXISTS (SELECT 0 FROM pg_class WHERE relname = 'tracked_cities_id_seq') THEN
                    CREATE SEQUENCE tracked_cities_id_seq;
                    ALTER TABLE tracked_cities ALTER COLUMN id SET DEFAULT nextval('tracked_cities_id_seq');
                    ALTER SEQUENCE tracked_cities_id_seq OWNED BY tracked_cities.id;
                    PERFORM setval('tracked_cities_id_seq', COALESCE((SELECT MAX(id) FROM tracked_cities), 0) + 1, false);
                  END IF;
                END $$;
              `);
              
              console.log('✅ Database sequences verified and fixed');
            }
          }
        }
      } catch (seqError) {
        console.error('⚠️  Error checking/fixing table structure:', seqError.message);
        console.log('💡 You may need to manually drop and recreate tables');
      }
    }
    
    dbConnected = true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Retrying database connection in 5 seconds...');
    
    // Retry connection
    setTimeout(() => {
      dbConnected = false;
      connectDatabase();
    }, 5000);
  }
}

const startServer = () => {
  if (server) {
    return server;
  }

  const PORT = process.env.PORT || 10000;
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
    console.log(`🏠 Landing page: / (serves landing.html)`);
    console.log(`📊 Dashboard: /dashboard (serves index.html)`);
  });

  server.keepAliveTimeout = 120000; // 120 seconds
  server.headersTimeout = 120000; // 120 seconds

  connectDatabase();

  keepAliveInterval = setInterval(() => {
    if (dbConnected && !isShuttingDown) {
      sequelize.authenticate()
        .catch(err => {
          console.error('Database connection lost:', err.message);
          dbConnected = false;
          connectDatabase();
        });
    }
  }, 30000);

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return server;
};

const stopServer = async () => {
  if (!server) {
    return;
  }

  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }

  await new Promise((resolve) => server.close(resolve));
  server = null;
  dbConnected = false;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
module.exports.stopServer = stopServer;
module.exports.connectDatabase = connectDatabase;