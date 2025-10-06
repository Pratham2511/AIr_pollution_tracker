const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sanitizeName, normalizeEmail, validatePasswordStrength } = require('../utils/security');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'default-jwt-secret-please-change-in-production';
  return jwt.sign({ id }, secret, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const sanitizedName = sanitizeName(name);
    const normalizedEmail = normalizeEmail(email);
    
    // Validate input
    if (!sanitizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }
    
    const strengthCheck = validatePasswordStrength(password, {
      email: normalizedEmail,
      name: sanitizedName
    });

    if (!strengthCheck.isValid) {
      return res.status(400).json({
        message: strengthCheck.message || 'Password does not meet security requirements',
        code: 'WEAK_PASSWORD'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    
    // Create new user
    const user = await User.create({ name: sanitizedName, email: normalizedEmail, password });
    
    // Generate token
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    
    // Validate input
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
