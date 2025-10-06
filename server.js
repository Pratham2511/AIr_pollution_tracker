const express = require('express');
const path = require('path');
const compression = require('compression');
const { sequelize } = require('./models');

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

// Import routes
const authRoutes = require('./routes/authRoutes');
const pollutionRoutes = require('./routes/pollutionRoutes');

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

// Legacy routes for backward compatibility
app.get('/api/cities/count', async (req, res) => {
  try {
    // Redirect to new pollution route
    const fs = require('fs');
    const path = require('path');
    
    try {
      const citiesPath = path.join(__dirname, 'public/data/cities.js');
      if (fs.existsSync(citiesPath)) {
        const citiesContent = fs.readFileSync(citiesPath, 'utf8');
        const citiesMatch = citiesContent.match(/export const indianCitiesData = (\[[\s\S]*?\]);/);
        if (citiesMatch) {
          const citiesData = eval(citiesMatch[1]);
          return res.json({ count: citiesData.length });
        }
      }
    } catch (error) {
      console.log('Could not read cities.js file, using fallback count');
    }
    
    res.json({ count: 50 });
  } catch (error) {
    console.error('Error getting city count:', error);
    res.status(500).json({ message: 'Database not available yet' });
  }
});

app.get('/api/cities', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const citiesPath = path.join(__dirname, 'public/data/cities.js');
      if (fs.existsSync(citiesPath)) {
        const citiesContent = fs.readFileSync(citiesPath, 'utf8');
        const citiesMatch = citiesContent.match(/export const indianCitiesData = (\[[\s\S]*?\]);/);
        if (citiesMatch) {
          const citiesData = eval(citiesMatch[1]);
          return res.json(citiesData);
        }
      }
    } catch (error) {
      console.log('Could not read cities.js file, using fallback data');
    }
    
    // Fallback cities data
    const fallbackCities = [
      { name: 'Delhi', lat: 28.6139, lon: 77.2090, aqi: 285, pm25: 125, pm10: 180 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, aqi: 155, pm25: 65, pm10: 95 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946, aqi: 95, pm25: 40, pm10: 65 }
    ];
    
    res.json(fallbackCities);
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({ message: 'Database not available yet' });
  }
});

// Guest API for random city data
app.get('/api/guest/random-city', async (req, res) => {
  try {
    // Sample cities data for guest users
    const sampleCities = [
      { name: 'Delhi', aqi: 285, pm25: 125, pm10: 180, lat: 28.6139, lon: 77.2090 },
      { name: 'Mumbai', aqi: 155, pm25: 65, pm10: 95, lat: 19.0760, lon: 72.8777 },
      { name: 'Bangalore', aqi: 95, pm25: 40, pm10: 65, lat: 12.9716, lon: 77.5946 }
    ];
    
    const randomCity = sampleCities[Math.floor(Math.random() * sampleCities.length)];
    
    res.json({
      success: true,
      city: randomCity
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

// Start server immediately
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
  console.log(`🏠 Landing page: / (serves landing.html)`);
  console.log(`📊 Dashboard: /dashboard (serves index.html)`);
});

// Set timeouts to prevent 502 errors
server.keepAliveTimeout = 120000; // 120 seconds
server.headersTimeout = 120000; // 120 seconds

// Track if we're shutting down
let isShuttingDown = false;

// Handle graceful shutdown (only on actual shutdown, not random signals)
const gracefulShutdown = (signal) => {
  if (isShuttingDown) {
    console.log('Already shutting down...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);
  
  // Give some time for active connections to finish
  setTimeout(() => {
    server.close(() => {
      console.log('HTTP server closed');
      sequelize.close()
        .then(() => {
          console.log('Database connection closed');
          process.exit(0);
        })
        .catch(err => {
          console.error('Error closing database:', err);
          process.exit(1);
        });
    });
  }, 5000); // Wait 5 seconds before closing
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

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
    
    // Sync database
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database synchronized.');
    
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

// Start database connection immediately
connectDatabase();

// Keep database connection alive
setInterval(() => {
  if (dbConnected && !isShuttingDown) {
    sequelize.authenticate()
      .catch(err => {
        console.error('Database connection lost:', err.message);
        dbConnected = false;
        connectDatabase();
      });
  }
}, 30000); // Check every 30 seconds