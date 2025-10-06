const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Passw0rd!23', 12);

    await queryInterface.bulkInsert('users', [{
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: 'demo@example.com'
    }, {});
  }
};
