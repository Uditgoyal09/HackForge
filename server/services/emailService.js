const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return true; // Graceful fallback
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"HackForge Team" <noreply@hackforge.com>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false; // Don't throw, just log
  }
};

module.exports = { sendEmail };
