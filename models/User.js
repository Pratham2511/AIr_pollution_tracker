const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
        notEmpty: true
      }
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.checkPassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Alternative method name for compatibility
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
};