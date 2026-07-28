const Notification = require('../models/Notification');
// const { sendEmail } = require('./emailService'); // If we want to tie it together

const createNotification = async ({ recipient, type, title, message, link, metadata }, session = null) => {
  try {
    const options = session ? { session } : {};
    const notification = await Notification.create([{
      recipient,
      type,
      title,
      message,
      link,
      metadata,
    }], options);

    // TODO: Emit socket event here if socket.io is integrated
    // io.to(recipient.toString()).emit('notification', notification[0]);

    return notification[0];
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

module.exports = {
  createNotification,
};
