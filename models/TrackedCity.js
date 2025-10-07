module.exports = (sequelize, DataTypes) => {
  const TrackedCity = sequelize.define('TrackedCity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cityId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 120]
      }
    },
    notificationThreshold: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 500
      }
    }
  }, {
    tableName: 'tracked_cities',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'cityId']
      }
    ]
  });

  return TrackedCity;
};