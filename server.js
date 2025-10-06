const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

// Performance middleware (order matters!)
app.use(compression()); // Enable gzip compression
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size

// Database configuration
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'pollutiondb',
      process.env.DB_USER || 'pollutiondb_user',
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

// Models
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const City = sequelize.define('City', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  lon: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  aqi: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pm25: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  pm10: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  no2: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  so2: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  co: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  o3: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Prevent direct access to index.html
app.get('/index.html', (req, res) => {
  return res.redirect('/');
});

// Debug route to check files
app.get('/debug', (req, res) => {
    const files = [
        'public/landing.html',
        'public/index.html',
        'public/styles/common.css',
        'public/styles/landing.css'
    ];
    
    const results = files.map(file => {
        const filePath = path.join(__dirname, file);
        const exists = fs.existsSync(filePath);
        return { file, exists, fullPath: filePath };
    });
    
    res.json(results);
});

// Root route - serve landing page (first page users see)
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'landing.html');
    
    if (!fs.existsSync(filePath)) {
        console.error('Landing file not found:', filePath);
        return res.status(404).send('Landing page not found');
    }
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending landing page:', err);
            res.status(500).send('Error loading landing page');
        } else {
            console.log('Landing page served successfully');
        }
    });
});

// Dashboard route - serve index.html (your main dashboard page)
app.get('/dashboard', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');
    
    if (!fs.existsSync(filePath)) {
        console.error('Index file not found:', filePath);
        return res.status(404).send('Dashboard page not found');
    }
    
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending index page:', err);
            res.status(500).send('Error loading dashboard page');
        } else {
            console.log('Dashboard page (index.html) served successfully');
        }
    });
});

// Health check - respond even if database is not connected
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Service is healthy',
        database: sequelize.connectionManager.getConnection ? 'connected' : 'connecting'
    });
});

// API Routes - with error handling for database issues
app.get('/api/cities/count', async (req, res) => {
  try {
    const count = await City.count();
    res.json({ count });
  } catch (error) {
    console.error('Error getting city count:', error);
    res.status(500).json({ message: 'Database not available yet' });
  }
});

app.get('/api/cities', authenticateToken, async (req, res) => {
  try {
    const cities = await City.findAll();
    res.json(cities);
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({ message: 'Database not available yet' });
  }
});

app.post('/api/refresh-data', authenticateToken, async (req, res) => {
  try {
    const cities = await City.findAll();
    
    for (const city of cities) {
      await city.update({
        aqi: Math.floor(Math.random() * 300) + 50,
        pm25: Math.floor(Math.random() * 100) + 20,
        pm10: Math.floor(Math.random() * 150) + 30,
        no2: Math.floor(Math.random() * 80) + 10,
        so2: Math.floor(Math.random() * 60) + 5,
        co: Math.floor(Math.random() * 10) + 1,
        o3: Math.floor(Math.random() * 120) + 20
      });
    }
    
    res.json({ message: 'Data refreshed successfully' });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ message: 'Database not available yet' });
  }
});

// Authentication Routes - with error handling
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Normalize email to lowercase and trim
    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword
    });
    
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      res.status(503).json({ 
        message: 'Database is currently unavailable. Please try again in a few moments.',
        error: 'SERVICE_UNAVAILABLE'
      });
    } else if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ 
        message: error.errors[0].message || 'Validation error',
        error: 'VALIDATION_ERROR'
      });
    } else {
      res.status(500).json({ 
        message: 'Registration failed. Please try again.',
        error: 'SERVER_ERROR'
      });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Convert email to lowercase for case-insensitive comparison
    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      redirectUrl: '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      res.status(503).json({ 
        message: 'Database is currently unavailable. Please try again in a few moments.',
        error: 'SERVICE_UNAVAILABLE'
      });
    } else {
      res.status(500).json({ 
        message: 'Login failed. Please try again.',
        error: 'SERVER_ERROR'
      });
    }
  }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
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

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    sequelize.close().then(() => {
      console.log('Database connection closed');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Database connection in background
async function connectDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized.');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Retrying in 10 seconds...');
    setTimeout(connectDatabase, 10000);
  }
}

// Start database connection
connectDatabase();
