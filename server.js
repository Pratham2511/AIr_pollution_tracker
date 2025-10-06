const express = require('express');
const path = require('path');
const compression = require('compression');
const { sequelize } = require('./models');

const app = express();

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