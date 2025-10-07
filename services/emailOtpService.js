const nodemailer = require('nodemailer');
const crypto = require('crypto');

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// In-memory store to keep OTP records keyed by email
// Each record stores: { code: string, expiresAt: number, timeout: NodeJS.Timeout }
const otpStore = new Map();

/**
 * Generates a cryptographically secure 6-digit OTP
 */
function generateOtp() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Lazily instantiates and returns a nodemailer transporter configured for Outlook/Hotmail SMTP.
 */
function createTransporter() {
  const { EMAIL_USER, EMAIL_PASS, NODE_ENV } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    if (NODE_ENV === 'test') {
      console.warn('SMTP credentials missing in test environment. Falling back to mock transporter.');
      return {
        async sendMail() {
          return Promise.resolve();
        }
      };
    }

    throw new Error('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS in environment variables.');
  }

  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    },
    tls: {
      ciphers: 'TLSv1.2'
    }
  });
}

let transporter;

function clearOtp(email) {
  if (!otpStore.has(email)) {
    return;
  }

  const existing = otpStore.get(email);
  clearTimeout(existing.timeout);
  otpStore.delete(email);
}

/**
 * Creates/refreshes the OTP entry for the provided email and schedules automatic cleanup after expiry.
 */
function persistOtp(email, code) {
  clearOtp(email);

  const expiresAtTimestamp = Date.now() + OTP_EXPIRY_MS;
  const timeout = setTimeout(() => otpStore.delete(email), OTP_EXPIRY_MS);

  otpStore.set(email, { code, expiresAt: expiresAtTimestamp, timeout });
  return new Date(expiresAtTimestamp);
}

/**
 * Sends OTP email to the recipient using nodemailer.
 */
async function sendOtpEmail(email, code) {
  if (!transporter) {
    transporter = createTransporter();
  }

  const { EMAIL_USER } = process.env;

  const message = {
    from: {
      name: 'Airlytics Security',
      address: EMAIL_USER
    },
    to: email,
    subject: 'Your Airlytics Login OTP',
    text: `Your OTP for Airlytics login is: ${code}\nThis OTP is valid for 5 minutes.`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; color: #0f172a;">
        <h2 style="margin-bottom: 16px;">Airlytics Security Verification</h2>
        <p style="margin-bottom: 12px;">Your OTP for Airlytics login is:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${code}</div>
        <p style="margin-top: 20px;">This OTP is valid for 5 minutes.</p>
        <p style="margin-top: 24px; font-size: 12px; color: #64748b;">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(message);
}

/**
 * Generates an OTP, stores it in-memory, and delivers it through SMTP.
 */
async function issueOtp(email) {
  const code = generateOtp();

  try {
    clearOtp(email);
    await sendOtpEmail(email, code);
  } catch (error) {
    clearOtp(email);
    throw error;
  }

  const expiresAt = persistOtp(email, code);

  const exposeOtp = process.env.NODE_ENV === 'test' || process.env.EXPOSE_OTP_CODES === 'true';

  return {
    expiresAt,
    code: exposeOtp ? code : undefined
  };
}

/**
 * Verifies that the incoming OTP matches the stored one and hasn’t expired.
 */
function verifyOtp(email, incomingCode) {
  const record = otpStore.get(email);
  if (!record) {
    return { success: false, reason: 'NOT_FOUND', message: 'No OTP request found for this email.' };
  }

  const now = Date.now();
  if (record.expiresAt < now) {
    clearTimeout(record.timeout);
    otpStore.delete(email);
    return { success: false, reason: 'EXPIRED', message: 'This OTP has expired. Please request a new one.' };
  }

  if (record.code !== (incomingCode || '').trim()) {
    return { success: false, reason: 'MISMATCH', message: 'Invalid OTP. Please try again.' };
  }

  clearTimeout(record.timeout);
  otpStore.delete(email);
  return { success: true };
}

module.exports = {
  issueOtp,
  verifyOtp,
  OTP_EXPIRY_MS
};
