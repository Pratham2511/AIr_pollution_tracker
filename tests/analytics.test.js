process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'sqlite::memory:';

const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../server');
const { sequelize, City, PollutionReading, CityDailySummary, User } = require('../models');
const { generateSeedData } = require('../utils/dataGenerator');

describe('Analytics Routes', () => {
  let adminToken;
  let sampleCity;
  let cityIdSubset;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const seed = generateSeedData({ targetCities: 8, hours: 48, days: 5 });

    await City.bulkCreate(seed.cities);
    await PollutionReading.bulkCreate(seed.pollutionReadings);
    await CityDailySummary.bulkCreate(seed.dailySummaries);

    sampleCity = seed.cities[0];
    cityIdSubset = seed.cities.slice(0, 2).map(city => city.id);

    const admin = await User.create({
      name: 'Analytics Admin',
      email: 'analytics-admin@example.com',
      password: 'Str0ng!Passw0rd',
      isAdmin: true
    });

    adminToken = jwt.sign({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin
    }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await sequelize.truncate({ cascade: true });
  });

  describe('GET /api/analytics/cities', () => {
    it('returns a list of cities with metadata', async () => {
      const response = await request(app)
        .get('/api/analytics/cities?limit=5');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('count', 5);
      expect(Array.isArray(response.body.cities)).toBe(true);
      expect(response.body.cities.length).toBeLessThanOrEqual(5);
      expect(response.body.cities[0]).toEqual(
        expect.objectContaining({ slug: expect.any(String), name: expect.any(String) })
      );
    });

    it('filters cities by search term and region flag', async () => {
      const query = sampleCity.name.slice(0, 3);
      const response = await request(app)
        .get(`/api/analytics/cities?search=${encodeURIComponent(query)}&isIndian=${sampleCity.isIndian}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.cities.some(city => city.slug === sampleCity.slug)).toBe(true);
    });
  });

  describe('GET /api/analytics/cities/:slug/analytics', () => {
    it('returns analytics payload for a valid city slug', async () => {
      const response = await request(app)
        .get(`/api/analytics/cities/${sampleCity.slug}/analytics`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('city');
      expect(response.body.city.name).toBe(sampleCity.name);
      expect(Array.isArray(response.body.aqiTrend)).toBe(true);
      expect(response.body.aqiTrend.length).toBeGreaterThan(0);
    });

    it('returns 404 when city analytics missing', async () => {
      const response = await request(app)
        .get('/api/analytics/cities/non-existent-city/analytics');

      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'City not found');
    });
  });

  describe('GET /api/analytics/overview', () => {
    it('returns aggregate overview metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/overview');

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body.cities.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('categoryDistribution');
      expect(response.body.rankings).toEqual(
        expect.objectContaining({ best: expect.any(Object), worst: expect.any(Object) })
      );
    });

    it('respects the cityIds filter when provided', async () => {
      const response = await request(app)
        .get(`/api/analytics/overview?cityIds=${cityIdSubset.join(',')}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.cities.length).toBeLessThanOrEqual(cityIdSubset.length);
    });
  });

  describe('POST /api/analytics/refresh', () => {
    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/analytics/refresh');

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message', 'Access denied. No token provided.');
    });

    it('returns 400 when refresh not supported by dialect', async () => {
      const response = await request(app)
        .post('/api/analytics/refresh')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Analytics refresh is only available for PostgreSQL');
    });
  });
});
