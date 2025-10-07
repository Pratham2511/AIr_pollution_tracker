module.exports = {
  up: async (queryInterface, Sequelize) => {
    const timestampDefault = queryInterface.sequelize.getDialect() === 'sqlite'
      ? Sequelize.literal('CURRENT_TIMESTAMP')
      : Sequelize.fn('NOW');

    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(120)
      },
      email: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(160)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(255)
      },
      isAdmin: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      lastLoginAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: timestampDefault
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: timestampDefault
      }
    });

    await queryInterface.addIndex('users', ['email']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  }
};
