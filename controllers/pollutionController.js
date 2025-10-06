const { Op } = require('sequelize');
const { PollutionReading, User } = require('../models');
const pollutionService = require('../services/pollutionService');

exports.createPollutionReading = async (req, res) => {
  try {
    const readingData = {
      ...req.body,
      userId: req.user.id
    };
    
    const reading = await PollutionReading.create(readingData);
    
    res.status(201).json({
      message: 'Pollution reading created successfully',
      reading
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating pollution reading' });
  }
};

exports.getPollutionReadings = async (req, res) => {
  try {
    const {
      page = 1,
      city,
      startDate,
      endDate
    } = req.query;

    const parsedPage = Number.parseInt(page, 10);
    let pageNumber = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);

    const parsedLimit = Number.parseInt(req.query.limit, 10);
    let limitNumber = Number.isNaN(parsedLimit) ? 10 : Math.min(Math.max(parsedLimit, 1), 100);
    
    // For guest users, limit the data access
    if (req.user.isGuest) {
      limitNumber = Math.min(limitNumber, 5); // Restrict to max 5 items per page for guests
    }
    const offset = (pageNumber - 1) * limitNumber;
    
    const where = {};
    if (city) {
      where.city = city;
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
      offset,
      order: [['recordedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    // For guest users, limit the response data
    let responseData = {
      pollutionReadings: rows,
      totalPages: Math.ceil(count / limitNumber) || 1,
      currentPage: pageNumber,
      totalItems: count
    };

    if (req.user.isGuest) {
      // Simplify data for guest users
      responseData.pollutionReadings = rows.map(reading => ({
        id: reading.id,
        city: reading.city,
        aqi: reading.aqi,
        recordedAt: reading.recordedAt,
        pollutants: {
          pm25: reading.pm25,
          pm10: reading.pm10
        }
      }));
    }
    
    res.json(responseData);
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
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
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
    
    // Check if reading exists
    const reading = await PollutionReading.findByPk(id);
    if (!reading) {
      return res.status(404).json({ message: 'Pollution reading not found' });
    }
    
    // Check if user is admin or the owner of the reading
    if (!user.isAdmin && reading.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update reading
    await reading.update(req.body);
    
    res.json({
      message: 'Pollution reading updated successfully',
      reading
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating pollution reading' });
  }
};

exports.deletePollutionReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Check if reading exists
    const reading = await PollutionReading.findByPk(id);
    if (!reading) {
      return res.status(404).json({ message: 'Pollution reading not found' });
    }
    
    // Check if user is admin or the owner of the reading
    if (!user.isAdmin && reading.userId !== user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Delete reading
    await reading.destroy();
    
    res.json({ message: 'Pollution reading deleted successfully' });
  } catch (error) {
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
    
    // For guest users, limit the response data
    if (req.user.isGuest) {
      latestReading = {
        id: latestReading.id,
        city: latestReading.city,
        aqi: latestReading.aqi,
        recordedAt: latestReading.recordedAt,
        pollutants: {
          pm25: latestReading.pm25,
          pm10: latestReading.pm10
        }
      };
    }
    
    res.json({ latestReading });
  } catch (error) {
    console.error('Error fetching latest pollution data:', error);
    res.status(500).json({ message: 'Server error fetching latest pollution data' });
  }
};

// Get all cities (for frontend cities count)
exports.getCities = async (req, res) => {
  try {
    // Use the cities data from data folder
    const { indianCitiesData } = require('../data/citiesData');
    res.json(indianCitiesData);
  } catch (error) {
    console.error('Error fetching cities:', error);
    // Fallback cities data
    const fallbackCities = [
      { name: 'Delhi', lat: 28.6139, lon: 77.2090, aqi: 285, pm25: 125, pm10: 180, no2: 68, so2: 22, co: 2.8, o3: 85 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, aqi: 155, pm25: 65, pm10: 95, no2: 45, so2: 15, co: 1.8, o3: 55 },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946, aqi: 95, pm25: 40, pm10: 65, no2: 38, so2: 12, co: 1.2, o3: 48 }
    ];
    res.json(fallbackCities);
  }
};

// Get cities count
exports.getCitiesCount = async (req, res) => {
  try {
    // Get cities and return count
    const { indianCitiesData } = require('../data/citiesData');
    res.json({ count: indianCitiesData.length });
  } catch (error) {
    console.error('Error getting cities count:', error);
    res.json({ count: 50 });
  }
};
