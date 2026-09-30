const ReminderPreference = require('../models/ReminderPreference');

async function getPreferences(userId) {
  const preferences = await ReminderPreference.findOne({ user: userId });

  if (!preferences) {
    return {
      user: userId,
      enabled: false,
      days: [],
      time: null,
    };
  }

  return preferences;
}

async function updatePreferences(userId, { enabled, days, time }) {
  if (enabled && (!days || days.length === 0)) {
    const error = new Error('Please select at least one day to enable reminders');
    error.statusCode = 400;
    throw error;
  }

  return ReminderPreference.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      enabled,
      days: enabled ? days : [],
      time: enabled ? time : null,
    },
    { new: true, upsert: true, runValidators: true }
  );
}

function resolveReminder(event, plan, account) {
  if (event?.reminderOverride !== null && event?.reminderOverride !== undefined) {
    return { setting: event.reminderOverride, source: 'task' };
  }
  if (plan?.reminderOverride !== null && plan?.reminderOverride !== undefined) {
    return { setting: plan.reminderOverride, source: 'course' };
  }
  return { setting: account, source: 'account' };
}

module.exports = {
  getPreferences,
  updatePreferences,
  resolveReminder,
};
