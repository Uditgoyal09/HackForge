const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer, folder = 'hackforge') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured, gracefully degrade
    if (cloudinary.config().cloud_name === 'fallback') {
      return resolve({
        url: 'https://via.placeholder.com/800x400?text=Cloudinary+Not+Configured',
        public_id: `fallback_${Date.now()}`
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve({ url: result.secure_url, public_id: result.public_id });
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (cloudinary.config().cloud_name === 'fallback' || !publicId || publicId.startsWith('fallback_')) {
    return;
  }
  
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete asset from Cloudinary:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
