const { generateSeedData } = require('../utils/dataGenerator');

module.exports = {
  up: async (queryInterface) => {
    const { cities, pollutionReadings, dailySummaries } = generateSeedData({
      targetCities: 180,
      hours: 96,
      days: 7
    });

    await queryInterface.bulkInsert('cities', cities);
    await queryInterface.bulkInsert('pollution_readings', pollutionReadings);
    await queryInterface.bulkInsert('city_daily_summaries', dailySummaries);

    const trackedCities = cities.slice(0, 6).map((city, index) => ({
      userId: 1,
      cityId: city.id,
      alias: index === 0 ? 'Home City' : null,
      notificationThreshold: 200,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (trackedCities.length) {
      await queryInterface.bulkInsert('tracked_cities', trackedCities);
    }

    if (queryInterface.sequelize.getDialect() === 'postgres') {
      await queryInterface.sequelize.query(`SELECT setval('cities_id_seq', (SELECT MAX(id) FROM cities))`);
      await queryInterface.sequelize.query(`SELECT setval('pollution_readings_id_seq', (SELECT MAX(id) FROM pollution_readings))`);
      await queryInterface.sequelize.query(`SELECT setval('city_daily_summaries_id_seq', (SELECT MAX(id) FROM city_daily_summaries))`);
      await queryInterface.sequelize.query(`SELECT setval('tracked_cities_id_seq', (SELECT MAX(id) FROM tracked_cities))`);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('tracked_cities', null, {});
    await queryInterface.bulkDelete('city_daily_summaries', null, {});
    await queryInterface.bulkDelete('pollution_readings', null, {});
    await queryInterface.bulkDelete('cities', null, {});
  }
};
