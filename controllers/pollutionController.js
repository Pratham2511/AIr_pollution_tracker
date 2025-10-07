const { Op } = require('sequelize');

const { PollutionReading, City, User } = require('../models');
const pollutionService = require('../services/pollutionService');
const { classifyAqi } = require('../services/healthAdvisor');

const determineDominantPollutant = (reading) => {
  const pollutants = {
    pm25: reading.pm25,
    pm10: reading.pm10,
    co: reading.co,
    no2: reading.no2,
    so2: reading.so2,
    o3: reading.o3
  };

  const ranked = Object.entries(pollutants)
    .filter(([, value]) => typeof value === 'number' && !Number.isNaN(value))
    .sort(([, valueA], [, valueB]) => valueB - valueA);

  return ranked.length ? ranked[0][0] : 'pm25';
};

const enrichReading = (reading) => {
  const dominantPollutant = determineDominantPollutant(reading);
  const category = classifyAqi(Number(reading.aqi) || 0);

  return {
    ...reading,
    aqiCategory: category.id,
    dominantPollutant
  };
};

const pickWritableFields = (reading) => {
  const allowedFields = [
    'cityId',
    'recordedAt',
    'aqi',
    'aqiCategory',
    'dominantPollutant',
    'pm25',
    'pm10',
    'co',
    'no2',
    'so2',
    'o3',
    'temperature',
    'humidity',
    'windSpeed',
    'dataSource'
  ];

  return Object.fromEntries(
    allowedFields
      .filter(field => reading[field] !== undefined)
      .map(field => [field, reading[field]])
  );
};

exports.createPollutionReading = async (req, res) => {
  try {
    const readingPayload = enrichReading(req.body);

    const reading = await PollutionReading.create({
      ...pickWritableFields(readingPayload),
      userId: req.user.id
    });

    res.status(201).json({
      message: 'Pollution reading created successfully',
      reading
    });
  } catch (error) {
    console.error('Error creating pollution reading:', error);
    res.status(500).json({ message: 'Server error creating pollution reading' });
  }
};

exports.getPollutionReadings = async (req, res) => {
  try {
    const {
      page = 1,
      cityId,
      startDate,
      endDate
    } = req.query;

    const parsedPage = Number.parseInt(page, 10);
    const pageNumber = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);

    const parsedLimit = Number.parseInt(req.query.limit, 10);
    let limitNumber = Number.isNaN(parsedLimit) ? 10 : Math.min(Math.max(parsedLimit, 1), 100);

    if (req.user?.isGuest) {
      limitNumber = Math.min(limitNumber, 5);
    }

    const where = {};
    if (cityId) {
      where.cityId = Number(cityId);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!Number.isNaN(start.valueOf()) && !Number.isNaN(end.valueOf())) {
        where.recordedAt = {
          [Op.between]: [start, end]
        };
      }
    }

    const { count, rows } = await PollutionReading.findAndCountAll({
      where,
      limit: limitNumber,
      offset: (pageNumber - 1) * limitNumber,
      order: [['recordedAt', 'DESC']],
      include: [
        {
          model: City,
          as: 'city'
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    const readings = rows.map(row => {
      const plain = row.get({ plain: true });
      return {
        id: plain.id,
        city: plain.city,
        user: plain.user,
        aqi: plain.aqi,
        aqiCategory: plain.aqiCategory,
        dominantPollutant: plain.dominantPollutant,
        recordedAt: plain.recordedAt,
        pollutants: {
          pm25: plain.pm25,
          pm10: plain.pm10,
          co: plain.co,
          no2: plain.no2,
          so2: plain.so2,
          o3: plain.o3
        },
        weather: {
          temperature: plain.temperature,
          humidity: plain.humidity,
          windSpeed: plain.windSpeed
        },
        dataSource: plain.dataSource
      };
    });

    res.json({
      pollutionReadings: req.user?.isGuest
        ? readings.map(reading => ({
            id: reading.id,
            city: {
              name: reading.city?.name,
              country: reading.city?.country
            },
            aqi: reading.aqi,
            recordedAt: reading.recordedAt,
            pollutants: {
              pm25: reading.pollutants.pm25,
              pm10: reading.pollutants.pm10
            }
          }))
        : readings,
      totalPages: Math.ceil(count / limitNumber) || 1,
      currentPage: pageNumber,
      totalItems: count
    });
  } catch (error) {
    console.error('Error fetching pollution readings:', error);
    res.status(500).json({ message: 'Server error fetching pollution readings' });
  }
};

exports.getPollutionReadingById = async (req, res) => {
  try {
    const { id } = req.params;

    const reading = await PollutionReading.findByPk(id, {
      include: [
        { model: City, as: 'city' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!reading) {
      return res.status(404).json({ message: 'Pollution reading not found' });
    }

    res.json({ reading });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching pollution reading' });
  }
};

exports.updatePollutionReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const reading = await PollutionReading.findByPk(id);
    if (!reading) {
      return res.status(404).json({ message: 'Pollution reading not found' });
    }

    if (!user.isAdmin && reading.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

  const payload = enrichReading({ ...reading.toJSON(), ...req.body });
  await reading.update(pickWritableFields(payload));

    res.json({
      message: 'Pollution reading updated successfully',
      reading
    });
  } catch (error) {
    console.error('Error updating pollution reading:', error);
    res.status(500).json({ message: 'Server error updating pollution reading' });
  }
};

exports.deletePollutionReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const reading = await PollutionReading.findByPk(id);
    if (!reading) {
      return res.status(404).json({ message: 'Pollution reading not found' });
    }

    if (!user.isAdmin && reading.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await reading.destroy();

    res.json({ message: 'Pollution reading deleted successfully' });
  } catch (error) {
    console.error('Error deleting pollution reading:', error);
    res.status(500).json({ message: 'Server error deleting pollution reading' });
  }
};

exports.getLatestPollutionByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ message: 'City parameter is required' });
    }

    let latestReading = await pollutionService.getLatestByCity(city);

    if (!latestReading) {
      return res.status(404).json({ message: 'No pollution data found for this city' });
    }

    const payload = {
      id: latestReading.id,
      city: latestReading.city,
      aqi: latestReading.aqi,
      aqiCategory: latestReading.aqiCategory,
      dominantPollutant: latestReading.dominantPollutant,
      recordedAt: latestReading.recordedAt,
      pollutants: {
        pm25: latestReading.pm25,
        pm10: latestReading.pm10,
        co: latestReading.co,
        no2: latestReading.no2,
        so2: latestReading.so2,
        o3: latestReading.o3
      }
    };

    if (req.user?.isGuest) {
      payload.pollutants = {
        pm25: payload.pollutants.pm25,
        pm10: payload.pollutants.pm10
      };
    }

    res.json({ latestReading: payload });
  } catch (error) {
    console.error('Error fetching latest pollution data:', error);
    res.status(500).json({ message: 'Server error fetching latest pollution data' });
  }
};

exports.getCities = async (req, res) => {
  try {
    const cities = await City.findAll({
      attributes: ['id', 'name', 'slug', 'country', 'region', 'latitude', 'longitude', 'isIndian']
    });
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Server error fetching cities' });
  }
};

exports.getCitiesCount = async (req, res) => {
  try {
    const count = await City.count();
    res.json({ count });
  } catch (error) {
    console.error('Error getting cities count:', error);
    res.json({ count: 0 });
  }
};
