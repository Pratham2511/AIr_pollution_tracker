const analyticsService = require('../services/analyticsService');
const { getCityByIdentifier } = require('../services/pollutionService');
const { sequelize, City } = require('../models');

const formatCityResponse = (city) => ({
  id: city.id,
  name: city.name,
  slug: city.slug,
  country: city.country,
  region: city.region,
  latitude: city.latitude,
  longitude: city.longitude,
  isIndian: city.isIndian
});

exports.listCities = async (req, res) => {
  try {
    const { search, limit = 200, isIndian } = req.query;
    const where = {};

    if (search) {
      where.name = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        'LIKE',
        `%${search.toLowerCase()}%`
      );
    }

    if (typeof isIndian !== 'undefined') {
      where.isIndian = isIndian === 'true';
    }

    const cities = await City.findAll({
      where,
      limit: Math.min(Number(limit) || 200, 500),
      order: [['name', 'ASC']]
    });

    res.json({
      count: cities.length,
      cities: cities.map(formatCityResponse)
    });
  } catch (error) {
    console.error('Error listing cities:', error);
    res.status(500).json({ message: 'Server error fetching cities' });
  }
};

exports.getCity = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const city = await getCityByIdentifier(slugOrId);

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    res.json({ city: formatCityResponse(city) });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({ message: 'Server error fetching city' });
  }
};

exports.getCityAnalytics = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const city = await getCityByIdentifier(slugOrId);

    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const analytics = await analyticsService.getCityAnalytics(city.slug);
    if (!analytics) {
      return res.status(404).json({ message: 'No analytics available for this city' });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching city analytics:', error);
    res.status(500).json({ message: 'Server error fetching city analytics' });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const { cityIds } = req.query;
    const parsedIds = cityIds
      ? cityIds
          .split(',')
          .map(id => parseInt(id, 10))
          .filter(id => !Number.isNaN(id))
      : undefined;

    const overview = await analyticsService.buildOverallAnalytics(parsedIds);
    if (!overview) {
      return res.status(404).json({ message: 'No analytics overview available' });
    }

    res.json(overview);
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ message: 'Server error fetching overview analytics' });
  }
};

exports.refreshMaterializedView = async (req, res) => {
  try {
    if (sequelize.getDialect() !== 'postgres') {
      return res.status(400).json({ message: 'Analytics refresh is only available for PostgreSQL' });
    }

    const [result] = await sequelize.query('SELECT refresh_city_pollution_analytics()');
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error refreshing analytics view:', error);
    res.status(500).json({ message: 'Failed to refresh analytics view' });
  }
};
