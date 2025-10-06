const { Sequelize, DataTypes } = require('sequelize');

// Database configuration with better connection handling
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        connectTimeout: 60000 // 60 seconds
      },
      pool: {
        max: 10,
        min: 2,
        acquire: 60000,
        idle: 10000,
        evict: 1000
      },
      retry: {
        max: 5,
        timeout: 3000
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
          },
          connectTimeout: 60000
        },
        pool: {
          max: 10,
          min: 2,
          acquire: 60000,
          idle: 10000,
          evict: 1000
        },
        retry: {
          max: 5,
          timeout: 3000
        }
      }
    );

// Import models
const User = require('./User')(sequelize, DataTypes);
const PollutionReading = require('./PollutionReading')(sequelize, DataTypes);
const TrackedCity = require('./TrackedCity')(sequelize, DataTypes);

// Define associations
User.hasMany(PollutionReading, { foreignKey: 'userId', as: 'pollutionReadings' });
PollutionReading.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(TrackedCity, { foreignKey: 'userId', as: 'trackedCities' });
TrackedCity.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export models and sequelize
module.exports = {
  sequelize,
  User,
  PollutionReading,
  TrackedCity
};