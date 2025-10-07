const { issueOtp, verifyOtp, OTP_EXPIRY_MS } = require('../services/emailOtpService');
const { normalizeEmail } = require('../utils/security');

const FIVE_MINUTES = OTP_EXPIRY_MS / 1000 / 60;

exports.sendOtp = async (req, res) => {
  try {
    const rawEmail = req.body?.email;
    const email = normalizeEmail(rawEmail);

    if (!email) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    await issueOtp(email);

    res.json({
      message: 'OTP sent successfully.',
      expiresInMinutes: FIVE_MINUTES
    });
  } catch (error) {
    console.error('Failed to send OTP email:', error.message);
    res.status(500).json({ message: 'Unable to send OTP email. Please try again later.' });
  }
};

exports.verifyOtp = async (req, res) => {
  const rawEmail = req.body?.email;
  const email = normalizeEmail(rawEmail);
  const otp = req.body?.otp;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const verification = verifyOtp(email, otp);

  if (!verification.success) {
    return res.status(400).json({
      message: verification.message || 'OTP verification failed.',
      reason: verification.reason
    });
  }

  res.json({ message: 'OTP verified successfully.' });
};
