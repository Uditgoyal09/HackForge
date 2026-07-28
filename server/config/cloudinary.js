const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'fallback',
  api_key: process.env.CLOUDINARY_API_KEY || 'fallback',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'fallback',
});

module.exports = cloudinary;
