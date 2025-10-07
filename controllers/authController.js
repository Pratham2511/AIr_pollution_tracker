const jwt = require('jsonwebtoken');

const { User } = require('../models');
const { sanitizeName, normalizeEmail, validatePasswordStrength } = require('../utils/security');
const { suggestEmailCorrection } = require('../utils/email');
const { generateAndDeliverOtp, verifyOtpCode } = require('../services/otpService');

const buildTokenPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin || false
});

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'default-jwt-secret-please-change-in-production';
  return jwt.sign(buildTokenPayload(user), secret, { expiresIn: '24h' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const sanitizedName = sanitizeName(name);
    const normalizedEmail = normalizeEmail(email);

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

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({ name: sanitizedName, email: normalizedEmail, password });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: buildTokenPayload(user)
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
    const suggestion = suggestEmailCorrection(normalizedEmail);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
        ...(suggestion ? { emailSuggestion: suggestion } : {})
      });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const otpResult = await generateAndDeliverOtp({
      email: normalizedEmail
    });

    if (otpResult.fallback) {
      const token = generateToken(user);
      return res.json({
        message: 'Email delivery unavailable. Logged in using OTP fallback mode—configure SMTP to re-enable verification.',
        otpRequired: false,
        fallback: true,
        delivery: otpResult.delivery,
        ...(suggestion ? { emailSuggestion: suggestion } : {}),
        token,
        user: buildTokenPayload(user)
      });
    }

    const response = {
      message: 'OTP sent to your email address',
      otpRequired: true,
      expiresAt: otpResult.expiresAt,
      delivery: otpResult.delivery,
      ...(suggestion ? { emailSuggestion: suggestion } : {}),
      user: {
        email: user.email,
        name: user.name
      }
    };

    if (otpResult.otp) {
      response.testOtp = otpResult.otp;
    }

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { otp } = req.body;

    const verification = await verifyOtpCode({ email: normalizedEmail, otp });

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        code: verification.reason
      });
    }

    const user = verification.user || await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(404).json({ message: 'User not found for verified email.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'OTP verified successfully',
      token,
      user: buildTokenPayload(user)
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      message: 'Server error verifying OTP',
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
