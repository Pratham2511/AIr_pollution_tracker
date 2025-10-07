const express = require('express');

const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { guestAuth, restrictGuestFeature } = require('../middleware/guestAuth');
const { auth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/cities', generalLimiter, guestAuth, analyticsController.listCities);
router.get('/cities/:slugOrId', generalLimiter, guestAuth, analyticsController.getCity);
router.get('/cities/:slugOrId/analytics', generalLimiter, guestAuth, analyticsController.getCityAnalytics);
router.get('/overview', generalLimiter, guestAuth, analyticsController.getOverview);
router.post('/refresh', generalLimiter, auth, restrictGuestFeature, analyticsController.refreshMaterializedView);

module.exports = router;
