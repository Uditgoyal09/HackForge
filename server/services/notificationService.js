const Notification = require('../models/Notification');

/**
 * Helper to deduplicate notifications based on eventKey
 * Prevents multiple identical notifications from being created
 */
const shouldCreateNotification = async (recipient, eventKey, session) => {
  if (!eventKey) return true; // If no deduplication key, always create

  const queryOptions = session ? { session } : {};
  const existing = await Notification.findOne({
    recipient,
    'metadata.eventKey': eventKey
  }, null, queryOptions);

  return !existing;
};

const createNotification = async ({ recipient, type, title, message, link, metadata }, session = null) => {
  try {
    const options = session ? { session } : {};

    // Deduplication check
    if (metadata && metadata.eventKey) {
      const shouldCreate = await shouldCreateNotification(recipient, metadata.eventKey, session);
      if (!shouldCreate) {
        console.log(`Skipped duplicate notification for eventKey: ${metadata.eventKey}`);
        return null;
      }
    }

    const notification = await Notification.create([{
      recipient,
      type,
      title,
      message,
      link,
      metadata,
    }], options);

    return notification[0];
  } catch (error) {
    console.error('Failed to create notification:', error);
    // Silent fail to not disrupt core business logic
    return null;
  }
};

const createManyNotifications = async (notificationsArray, session = null) => {
  try {
    const options = session ? { session } : {};

    // For bulk, we could do individual dedup, but to keep it performant, 
    // we'll fetch all existing eventKeys for these recipients.
    const keysToCheck = notificationsArray
      .filter(n => n.metadata && n.metadata.eventKey)
      .map(n => n.metadata.eventKey);

    let existingKeys = new Set();
    
    if (keysToCheck.length > 0) {
      const existing = await Notification.find({
        'metadata.eventKey': { $in: keysToCheck }
      }, 'metadata.eventKey recipient', options);

      existing.forEach(doc => {
        existingKeys.add(`${doc.recipient.toString()}_${doc.metadata.eventKey}`);
      });
    }

    // Filter out duplicates
    const toInsert = notificationsArray.filter(n => {
      if (n.metadata && n.metadata.eventKey) {
        const uniqueKey = `${n.recipient.toString()}_${n.metadata.eventKey}`;
        if (existingKeys.has(uniqueKey)) return false;
      }
      return true;
    });

    if (toInsert.length === 0) return [];

    const notifications = await Notification.insertMany(toInsert, options);
    return notifications;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error);
    return [];
  }
};

module.exports = {
  createNotification,
  createManyNotifications
};
