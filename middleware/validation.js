const { body, validationResult } = require('express-validator');
const { sanitizeName, normalizeEmail, validatePasswordStrength } = require('../utils/security');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUserRegistration = [
  body('name')
    .exists({ checkFalsy: true }).withMessage('Name is required')
    .bail()
    .customSanitizer(value => sanitizeName(value))
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[\p{L} .'-]+$/u).withMessage('Name may only include letters, spaces, apostrophes, periods, and hyphens'),
  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required')
    .bail()
    .customSanitizer(value => normalizeEmail(value))
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .bail()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must include at least one lowercase letter')
    .matches(/\d/).withMessage('Password must include at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must include at least one special character')
    .custom((value, { req }) => {
      const { isValid, message } = validatePasswordStrength(value, {
        email: req.body.email,
        name: req.body.name
      });

      if (!isValid) {
        throw new Error(message || 'Password does not meet security requirements');
      }

      return true;
    }),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .exists({ checkFalsy: true }).withMessage('Email is required')
    .bail()
    .customSanitizer(value => normalizeEmail(value))
    .isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .exists({ checkFalsy: true }).withMessage('Password is required')
    .bail()
    .isLength({ min: 1 }).withMessage('Password is required'),
  handleValidationErrors
];

const validatePollutionReading = [
  body('city').notEmpty().withMessage('City is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('aqi').isInt({ min: 0, max: 500 }).withMessage('AQI must be between 0 and 500'),
  body('pm25').isFloat({ min: 0 }).withMessage('PM2.5 must be a positive number'),
  body('pm10').isFloat({ min: 0 }).withMessage('PM10 must be a positive number'),
  body('no2').isFloat({ min: 0 }).withMessage('NO2 must be a positive number'),
  body('o3').isFloat({ min: 0 }).withMessage('O3 must be a positive number'),
  body('so2').isFloat({ min: 0 }).withMessage('SO2 must be a positive number'),
  body('co').isFloat({ min: 0 }).withMessage('CO must be a positive number'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validatePollutionReading
};
