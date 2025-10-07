module.exports = (sequelize, DataTypes) => {
  const PollutionReading = sequelize.define('PollutionReading', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recordedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    aqi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 500
      }
    },
    aqiCategory: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [[
          'good',
          'moderate',
          'unhealthy_sensitive',
          'unhealthy',
          'very_unhealthy',
          'hazardous'
        ]]
      }
    },
    dominantPollutant: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pm25: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 500
      }
    },
    pm10: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 600
      }
    },
    no2: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 400
      }
    },
    so2: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 300
      }
    },
    co: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 60
      }
    },
    o3: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 400
      }
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    windSpeed: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    dataSource: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'synthetic-model'
    }
  }, {
    tableName: 'pollution_readings',
    timestamps: true,
    indexes: [
      {
        fields: ['cityId', 'recordedAt']
      },
      {
        fields: ['recordedAt']
      },
      {
        fields: ['aqiCategory']
      }
    ]
  });

  return PollutionReading;
};