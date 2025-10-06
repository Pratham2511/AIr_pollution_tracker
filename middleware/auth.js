const jwt = require('jsonwebtoken');

const getJWTSecret = () => {
  return process.env.JWT_SECRET || 'default-jwt-secret-please-change-in-production';
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = jwt.verify(token, getJWTSecret());
    
    // Set user info from token (no database lookup needed)
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { auth, adminAuth };
