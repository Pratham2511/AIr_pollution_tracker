const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');

const { OtpToken, User } = require('../models');

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

const buildOtpMessage = (code, cityName = 'Airlytics') => {
  return {
    subject: `${cityName} verification code`,
    text: `Your one-time password is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color:#2563eb;">Your Airlytics OTP</h2>
        <p>Use the following one-time password to continue:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0;">${code}</div>
        <p>This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <p style="font-size:12px;color:#64748b;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `
  };
};

const sendOtpEmail = async (email, otpCode) => {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.warn('📬 MailerSend credentials missing. OTP will be logged for debugging purposes.');
    return { delivered: false, reason: 'missing-credentials' };
  }

  const payload = {
    from: { email: senderEmail, name: 'Airlytics Alerts' },
    to: [{ email }],
    reply_to: { email: senderEmail },
    ...buildOtpMessage(otpCode)
  };

  const response = await fetch('https://api.mailersend.com/v1/email', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to send OTP email via MailerSend:', errorText);
    throw new Error('Failed to send OTP email');
  }

  return { delivered: true };
};

const generateOtpCode = () => {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
};

const generateAndDeliverOtp = async ({ email, userId = null, ipAddress = null, userAgent = null }) => {
  const plainOtp = generateOtpCode();
  const hashedOtp = await bcrypt.hash(plainOtp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any previous pending tokens for this email
  await OtpToken.update(
    { consumedAt: new Date() },
    {
      where: {
        email,
        consumedAt: null,
        expiresAt: { [Op.lt]: new Date() }
      }
    }
  );

  const otpToken = await OtpToken.create({
    userId,
    email,
    otpCode: hashedOtp,
    expiresAt,
    ipAddress,
    userAgent
  });

  let deliveryResult = { delivered: false };
  try {
    deliveryResult = await sendOtpEmail(email, plainOtp);
  } catch (error) {
    console.warn('⚠️  OTP email delivery failed, but token stored. Error:', error.message);
  }

  const exposeOtp = process.env.NODE_ENV === 'test' || process.env.EXPOSE_OTP_CODES === 'true';

  return {
    otpTokenId: otpToken.id,
    expiresAt,
    delivery: deliveryResult,
    otp: exposeOtp ? plainOtp : undefined
  };
};

const verifyOtpCode = async ({ email, otp }) => {
  const normalizedOtp = (otp || '').trim();
  if (normalizedOtp.length !== 6) {
    return { success: false, reason: 'INVALID_FORMAT', message: 'OTP must be a 6-digit code.' };
  }

  const otpToken = await OtpToken.findOne({
    where: {
      email,
      consumedAt: null
    },
    order: [['createdAt', 'DESC']]
  });

  if (!otpToken) {
    return { success: false, reason: 'NOT_FOUND', message: 'No active OTP found. Please request a new code.' };
  }

  if (otpToken.expiresAt < new Date()) {
    return { success: false, reason: 'EXPIRED', message: 'This OTP has expired. Please request a new code.' };
  }

  if (otpToken.attemptCount >= MAX_ATTEMPTS) {
    return { success: false, reason: 'ATTEMPTS_EXCEEDED', message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  const isMatch = await bcrypt.compare(normalizedOtp, otpToken.otpCode);

  if (!isMatch) {
    await otpToken.update({ attemptCount: otpToken.attemptCount + 1 });
    return { success: false, reason: 'MISMATCH', message: 'Invalid OTP. Please try again.' };
  }

  await otpToken.update({ consumedAt: new Date() });

  let user = null;
  if (otpToken.userId) {
    user = await User.findByPk(otpToken.userId);
  } else {
    user = await User.findOne({ where: { email } });
  }

  return {
    success: true,
    user
  };
};

module.exports = {
  generateAndDeliverOtp,
  verifyOtpCode
};
