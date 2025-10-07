const { Op } = require('sequelize');

const { PollutionReading, City } = require('../models');

const getCityByIdentifier = async (identifier) => {
  if (Number.isInteger(Number(identifier))) {
    return City.findByPk(Number(identifier));
  }

  return City.findOne({
    where: {
      [Op.or]: [
        { slug: identifier },
        { name: identifier }
      ]
    }
  });
};

const getLatestByCity = async (identifier) => {
  const city = await getCityByIdentifier(identifier);
  if (!city) {
    return null;
  }

  return PollutionReading.findOne({
    where: { cityId: city.id },
    order: [['recordedAt', 'DESC']],
    include: [{ model: City, as: 'city' }]
  });
};

module.exports = {
  getLatestByCity,
  getCityByIdentifier
};
