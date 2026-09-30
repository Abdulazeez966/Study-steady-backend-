const reminderService = require('../services/reminderService');

async function getReminderSettings(req, res, next) {
  try {
    const userId = req.user.id; // set by authMiddleware

    const preferences = await reminderService.getPreferences(userId);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
}

async function updateReminderSettings(req, res, next) {
  try {
    const userId = req.user.id;
    const { enabled, days, time } = req.body;

    const preferences = await reminderService.updatePreferences(userId, {
      enabled,
      days,
      time,
    });

    res.status(200).json({
      success: true,
      message: 'Reminder preferences updated',
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getReminderSettings,
  updateReminderSettings,
};