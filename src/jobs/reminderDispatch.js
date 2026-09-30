const Event = require('../models/Event');
const Plan = require('../models/Plan');
const ReminderPreference = require('../models/ReminderPreference');
const reminderService = require('../services/reminderService');

function sameLocalDay(date, now) {
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate();
}

async function dispatchReminders(now = new Date()) {
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toTimeString().slice(0, 5);
  const events = await Event.find({
    scheduledDate: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) },
    status: { $nin: ['completed', 'missed'] },
    paused: false,
  }).populate('plan').populate('user');

  const userIds = [...new Set(events.map((event) => String(event.user?._id || event.user)))];
  const preferences = await ReminderPreference.find({ user: { $in: userIds } });
  const preferenceMap = new Map(preferences.map((preference) => [String(preference.user), preference]));
  const dueReminders = [];

  for (const event of events) {
    if (!sameLocalDay(new Date(event.scheduledDate), now)) continue;
    const account = preferenceMap.get(String(event.user?._id || event.user)) || {
      enabled: false,
      days: [],
      time: null,
    };
    const resolved = reminderService.resolveReminder(event, event.plan, account);
    const setting = resolved.setting;

    if (!setting?.enabled || !Array.isArray(setting.days) || !setting.days.includes(currentDay) || setting.time !== currentTime) continue;

    const reminder = {
      eventId: event._id,
      userId: event.user?._id || event.user,
      title: event.title,
      scheduledDate: event.scheduledDate,
      source: resolved.source,
      email: event.user?.email || null,
    };

    dueReminders.push(reminder);
    console.log(`Reminder due for ${event.user?.email || event.user}: ${event.title}`);
  }

  return dueReminders;
}

module.exports = { dispatchReminders };
