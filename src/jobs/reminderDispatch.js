const Event = require('../models/Event');
const Plan = require('../models/Plan');
const User = require('../models/User');
const ReminderPreference = require('../models/ReminderPreference');
const reminderService = require('../services/reminderService');
const notificationService = require('../services/notificationService');
const { sendTaskReminderEmail } = require('../services/emailService');

const PERIODS = {
  Morning: { time: '08:00', earlyStart: '05:30', earlyEnd: '08:00' },
  Afternoon: { time: '14:00', earlyStart: '11:00', earlyEnd: '14:00' },
  Evening: { time: '18:00', earlyStart: '15:30', earlyEnd: '18:00' },
};

function getLocalParts(date, timezone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return {
      weekday: map.weekday,
      dateKey: `${map.year}-${map.month}-${map.day}`,
      time: `${map.hour}:${map.minute}`,
    };
  } catch {
    return getLocalParts(date, 'UTC');
  }
}

function getPeriod(time) {
  const match = Object.entries(PERIODS).find(([, config]) => config.time === time);
  return match ? match[0] : null;
}

function isWithinWindow(time, start, end) {
  return time >= start && time < end;
}

function eventDateKey(event, timezone) {
  return getLocalParts(new Date(event.scheduledDate), timezone).dateKey;
}

async function dispatchReminders(now = new Date()) {
  const events = await Event.find({
    scheduledDate: { $gte: new Date(now.getTime() - 36 * 60 * 60 * 1000), $lte: new Date(now.getTime() + 36 * 60 * 60 * 1000) },
    status: 'upcoming',
    paused: false,
  }).populate('plan').populate('user');

  const userIds = [...new Set(events.map((event) => String(event.user?._id || event.user)).filter(Boolean))];
  if (!userIds.length) return [];

  const preferences = await ReminderPreference.find({ user: { $in: userIds }, enabled: true });
  const preferenceMap = new Map(preferences.map((preference) => [String(preference.user), preference]));
  const dueReminders = [];

  for (const event of events) {
    const user = event.user;
    if (!user?._id) continue;

    const timezone = user.timezone || 'UTC';
    const local = getLocalParts(now, timezone);
    if (eventDateKey(event, timezone) !== local.dateKey) continue;

    const account = preferenceMap.get(String(user._id));
    if (!account) continue;

    const resolved = reminderService.resolveReminder(event, event.plan, account);
    const setting = resolved.setting;
    if (!setting?.enabled || !Array.isArray(setting.days) || !setting.days.includes(local.weekday)) continue;

    const period = getPeriod(setting.time);
    if (!period) continue;
    const config = PERIODS[period];
    const dedupeKey = `${event._id}:${local.dateKey}:${period}`;
    const title = `Upcoming ${period.toLowerCase()} task`;
    const message = `${event.title} is scheduled for today.`;

    const atReminderTime = local.time === config.time;
    const activeRecently = user.lastActiveAt && (now.getTime() - new Date(user.lastActiveAt).getTime()) <= 5 * 60 * 1000;
    const inEarlyWindow = isWithinWindow(local.time, config.earlyStart, config.earlyEnd);

    // If the user is already in the app during the early window, create the in-app reminder immediately.
    if (inEarlyWindow && activeRecently) {
      await notificationService.createOrGetNotification({
        userId: user._id,
        eventId: event._id,
        title,
        message,
        reminderPeriod: period,
        dedupeKey,
      });
    }

    // At 08:00 / 14:00 / 18:00 local time, create the in-app reminder and send the email once.
    if (atReminderTime) {
      const notification = await notificationService.createOrGetNotification({
        userId: user._id,
        eventId: event._id,
        title,
        message,
        reminderPeriod: period,
        dedupeKey,
      });

      if (!notification.emailSentAt && user.email) {
        try {
          const emailResult = await sendTaskReminderEmail({
            to: user.email,
            name: user.name,
            title: event.title,
            period,
            scheduledDate: event.scheduledDate,
            timezone,
          });
          if (emailResult.sent) {
            notification.emailSentAt = new Date();
            await notification.save();
          }
        } catch (error) {
          console.error(`Failed to send reminder email to ${user.email}: ${error.message}`);
        }
      }

      dueReminders.push({
        eventId: event._id,
        userId: user._id,
        title: event.title,
        period,
        email: user.email,
      });
    }
  }

  return dueReminders;
}

module.exports = { dispatchReminders, PERIODS, getLocalParts };
