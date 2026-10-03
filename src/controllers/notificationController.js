const notificationService = require('../services/notificationService');

async function list(req, res, next) {
  try {
    const notifications = await notificationService.listNotifications(req.user.id, req.query);
    const unread = await notificationService.unreadCount(req.user.id);
    res.status(200).json({ success: true, data: { notifications, unread } });
  } catch (error) { next(error); }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markRead(req.user.id, req.params.id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) { next(error); }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user.id);
    res.status(200).json({ success: true, data: { unread: 0 } });
  } catch (error) { next(error); }
}

module.exports = { list, markRead, markAllRead };
