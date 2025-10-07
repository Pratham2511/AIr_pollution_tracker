module.exports = (sequelize, DataTypes) => {
  const CityDailySummary = sequelize.define('CityDailySummary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    summaryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    avgAqi: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    maxAqi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    minAqi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dominantPollutant: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avgPm25: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    avgPm10: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    avgCo: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    avgNo2: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    avgSo2: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    avgO3: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    trendScore: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'city_daily_summaries',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['cityId', 'summaryDate']
      },
      {
        fields: ['summaryDate']
      }
    ]
  });

  return CityDailySummary;
};
