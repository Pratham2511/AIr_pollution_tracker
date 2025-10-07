const { issueOtp, verifyOtp, OTP_EXPIRY_MS } = require('./emailOtpService');
const { User } = require('../models');

const OTP_EXPIRY_MINUTES = OTP_EXPIRY_MS / 1000 / 60;

const generateAndDeliverOtp = async ({ email }) => {
  try {
    const { expiresAt, code, delivery, fallback } = await issueOtp(email);

    return {
      otpTokenId: null,
      expiresAt,
      delivery,
      otp: code,
      fallback
    };
  } catch (error) {
    console.error('Failed to send OTP email via SMTP:', error.message);
    throw error;
  }
};

const verifyOtpCode = async ({ email, otp }) => {
  const result = verifyOtp(email, otp);

  if (!result.success) {
    return result;
  }

  const user = await User.findOne({ where: { email } });

  return {
    success: true,
    user
  };
};

module.exports = {
  generateAndDeliverOtp,
  verifyOtpCode
};
