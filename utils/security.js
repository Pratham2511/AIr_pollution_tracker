const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
  'monkey',
  'dragon',
  'football',
  'sunshine'
].map(password => password.toLowerCase()));

const sanitizeName = (name = '') => {
  if (typeof name !== 'string') {
    return '';
  }

  return name
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
};

const normalizeEmail = (email = '') => {
  if (typeof email !== 'string') {
    return '';
  }

  return email.trim().toLowerCase();
};

const tokenisePersonalInfo = (value = '') => {
  return sanitizeName(value)
    .toLowerCase()
    .split(/[^\p{L}\d]+/u)
    .filter(token => token.length >= 3);
};

const validatePasswordStrength = (password = '', context = {}) => {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one lowercase letter' };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must include at least one number' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one special character' };
  }

  const loweredPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.has(loweredPassword)) {
    return { isValid: false, message: 'Password is too common. Choose a more unique password.' };
  }

  const personalTokens = new Set();

  if (context.email) {
    const emailLocalPart = normalizeEmail(context.email).split('@')[0];
    if (emailLocalPart && emailLocalPart.length >= 3) {
      personalTokens.add(emailLocalPart);
    }
  }

  if (context.name) {
    tokenisePersonalInfo(context.name).forEach(token => personalTokens.add(token));
  }

  for (const token of personalTokens) {
    if (token && loweredPassword.includes(token)) {
      return {
        isValid: false,
        message: 'Password cannot contain parts of your name or email'
      };
    }
  }

  const sequentialPattern = /^(?:([A-Za-z])\1+|([0-9])\2+)$/;
  if (sequentialPattern.test(password)) {
    return { isValid: false, message: 'Password cannot be a repeated character sequence' };
  }

  if (/^[A-Za-z0-9]+$/.test(password)) {
    return { isValid: false, message: 'Password must include at least one special character' };
  }

  return { isValid: true };
};

module.exports = {
  sanitizeName,
  normalizeEmail,
  validatePasswordStrength
};
