const { auth } = require('./auth');

const guestAuth = async (req, res, next) => {
  try {
    // Check for guest header or token
    const userType = req.header('User-Type');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If no userType header is present, try token auth
    if (!userType && token) {
      return auth(req, res, next);
    }

    // Allow guest access for certain routes
    if (userType === 'guest') {
      req.user = { 
        isGuest: true,
        id: null,
        name: 'Guest User',
        email: null
      };
      next();
    } else {
      return res.status(401).json({ message: 'Access denied. Invalid user type.' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication.' });
  }
};

// Middleware to restrict features for guest users
const restrictGuestFeature = (req, res, next) => {
  if (req.user && req.user.isGuest) {
    return res.status(403).json({ 
      message: 'This feature is not available for guest users. Please register or login to access this feature.',
      error: 'GUEST_RESTRICTION'
    });
  }
  next();
};

module.exports = { guestAuth, restrictGuestFeature };