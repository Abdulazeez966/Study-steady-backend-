const Notification = require('../models/Notification');

async function listNotifications(userId, { limit = 30 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(safeLimit).lean();
}

async function unreadCount(userId) {
  return Notification.countDocuments({ user: userId, readAt: null });
}

async function markRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { readAt: new Date() },
    { new: true }
  );
  if (!notification) {
    const error = new Error('Notification not found');
    error.statusCode = 404;
    throw error;
  }
  return notification;
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, readAt: null }, { readAt: new Date() });
}

async function createOrGetNotification({ userId, eventId, title, message, reminderPeriod, dedupeKey }) {
  return Notification.findOneAndUpdate(
    { dedupeKey },
    {
      $setOnInsert: {
        user: userId,
        event: eventId || null,
        title,
        message,
        reminderPeriod,
        dedupeKey,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

module.exports = {
  listNotifications,
  unreadCount,
  markRead,
  markAllRead,
  createOrGetNotification,
};
