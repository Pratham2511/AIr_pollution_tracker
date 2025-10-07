module.exports = (sequelize, DataTypes) => {
  const OtpToken = sequelize.define('OtpToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    otpCode: {
      type: DataTypes.STRING(128),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    consumedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attemptCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'otp_tokens',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['expiresAt']
      },
      {
        fields: ['userId']
      }
    ]
  });

  return OtpToken;
};
