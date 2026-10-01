const Event = require('../models/Event');
const Activity = require('../models/Activity');

const MAX_PAUSE_DAYS = 90;

function isPauseExpired(pauseReturnDate) {
  return Boolean(pauseReturnDate) && new Date(pauseReturnDate) <= new Date();
}

// Same self-expiring behaviour as a paused Plan, but for a single event.
async function autoResumeIfExpired(event) {
  if (event && event.paused && isPauseExpired(event.pauseReturnDate)) {
    event.paused = false;
    event.pauseReturnDate = null;
    await event.save();
  }
  return event;
}

function validateReturnDate(returnDate) {
  if (!returnDate || new Date(returnDate) < new Date()) {
    const error = new Error('Return date must be in the future');
    error.statusCode = 400;
    throw error;
  }
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_PAUSE_DAYS);
  if (new Date(returnDate) > maxDate) {
    const error = new Error(`Return date cannot be more than ${MAX_PAUSE_DAYS} days away`);
    error.statusCode = 400;
    throw error;
  }
}

async function listEvents(userId, { date, planId, goalId } = {}) {
  const query = { user: userId };
  if (planId) query.plan = planId;
  if (goalId) query.goal = goalId;

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.scheduledDate = { $gte: start, $lt: end };
  }

  const events = await Event.find(query).sort({ scheduledDate: 1 });
  await Promise.all(events.map((e) => autoResumeIfExpired(e)));
  return events;
}

async function getEventById(userId, eventId) {
  const event = await Event.findOne({ _id: eventId, user: userId });
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  await autoResumeIfExpired(event);
  return event;
}

async function updateEvent(userId, eventId, { scheduledDate, estimatedMinutes, scheduledTime, title }) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, user: userId },
    { scheduledDate, estimatedMinutes, scheduledTime, ...(title !== undefined ? { title } : {}) },
    { new: true, runValidators: true }
  );
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
}

async function deleteEvent(userId, eventId) {
  const event = await Event.findOne({ _id: eventId, user: userId });
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  // Remove any activity linked to this scheduled occurrence so the deleted
  // event cannot leave an orphaned activity behind.
  await Activity.deleteMany({ event: event._id, user: userId });
  await Event.deleteOne({ _id: event._id, user: userId });
}

async function pauseEvent(userId, eventId, returnDate) {
  validateReturnDate(returnDate);
  const event = await Event.findOneAndUpdate(
    { _id: eventId, user: userId },
    { paused: true, pauseReturnDate: returnDate },
    { new: true }
  );
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
}

async function resumeEvent(userId, eventId) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, user: userId },
    { paused: false, pauseReturnDate: null },
    { new: true }
  );
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
}

async function updateReminderOverride(userId, eventId, override) {
  const event = await Event.findOneAndUpdate(
    { _id: eventId, user: userId },
    { reminderOverride: override },
    { new: true, runValidators: true }
  );
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }
  return event;
}

module.exports = {
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  pauseEvent,
  resumeEvent,
  updateReminderOverride,
  autoResumeIfExpired,
  isPauseExpired,
};
