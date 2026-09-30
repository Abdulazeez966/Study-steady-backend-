const Plan = require('../models/Plan');
const Event = require('../models/Event');
const Activity = require('../models/Activity');

const MAX_PAUSE_DAYS = 90;

function isPauseExpired(pausedUntil) {
  return Boolean(pausedUntil) && new Date(pausedUntil) <= new Date();
}

// A pause is meant to lift itself once the return date arrives, the same
// way it already works on the frontend — this keeps stored data honest
// without needing a separate scheduled job for correctness.
async function autoResumeIfExpired(plan) {
  if (plan && plan.status === 'paused' && isPauseExpired(plan.pausedUntil)) {
    plan.status = 'active';
    plan.pausedUntil = null;
    await plan.save();
  }
  return plan;
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

async function generateEventsFromPlan(plan) {
  const dayNameToNumber = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const selectedDayNumbers = plan.daysOfWeek.map((day) => dayNameToNumber[day]);

  const start = new Date(plan.startDate);
  const end = plan.endDate
    ? new Date(plan.endDate)
    : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);

  const events = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    if (selectedDayNumbers.includes(currentDate.getDay())) {
      for (const activity of plan.activities) {
        events.push({
          user: plan.user,
          plan: plan._id,
          goal: plan.goal,
          title: activity.title,
          estimatedMinutes: activity.estimatedMinutes || 30,
          scheduledDate: new Date(currentDate),
          status: 'upcoming',
        });
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (events.length > 0) {
    await Event.insertMany(events);
  }

  return events.length;
}

async function createPlan(userId, { goal, activities, weeklyTime, daysOfWeek, startDate, endDate }) {
  if (!activities || activities.length === 0) {
    const error = new Error('Please add at least one activity');
    error.statusCode = 400;
    throw error;
  }

  if (!daysOfWeek || daysOfWeek.length === 0) {
    const error = new Error('Please select at least one day');
    error.statusCode = 400;
    throw error;
  }

  const plan = await Plan.create({ user: userId, goal, activities, weeklyTime, daysOfWeek, startDate, endDate });

  await generateEventsFromPlan(plan);

  return plan;
}

async function pausePlan(userId, planId, returnDate) {
  validateReturnDate(returnDate);

  const plan = await Plan.findOneAndUpdate(
    { _id: planId, user: userId },
    { status: 'paused', pausedUntil: returnDate },
    { new: true }
  );

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  return plan;
}

async function resumePlan(userId, planId) {
  const plan = await Plan.findOneAndUpdate(
    { _id: planId, user: userId },
    { status: 'active', pausedUntil: null },
    { new: true }
  );

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  return plan;
}

async function adjustSchedule(userId, planId, { daysOfWeek, activities, weeklyTime, endDate }) {
  if (daysOfWeek !== undefined && daysOfWeek.length === 0) {
    const error = new Error('Please select at least one day');
    error.statusCode = 400;
    throw error;
  }

  if (activities !== undefined && activities.length === 0) {
    const error = new Error('Please add at least one activity');
    error.statusCode = 400;
    throw error;
  }

  const plan = await Plan.findOneAndUpdate(
    { _id: planId, user: userId },
    { daysOfWeek, activities, weeklyTime, endDate },
    { new: true, runValidators: true }
  );

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  await reconcileUpcomingEvents(plan);
  return plan;
}

async function reconcileUpcomingEvents(plan) {
  const dayNameToNumber = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  const selectedDayNumbers = plan.daysOfWeek.map((day) => dayNameToNumber[day]);
  const start = new Date(plan.startDate);
  const end = plan.endDate ? new Date(plan.endDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);
  const existingEvents = await Event.find({ plan: plan._id, user: plan.user, status: 'upcoming', scheduledDate: { $lte: end } }).sort({ scheduledDate: 1 });
  const existingActivityRows = await Activity.find({ event: { $in: existingEvents.map((event) => event._id) } }).select('event');
  const startedEventIds = new Set(existingActivityRows.map((row) => String(row.event)));
  const candidates = existingEvents.filter((event) => !startedEventIds.has(String(event._id)));
  const byKey = new Map(candidates.map((event) => [`${new Date(event.scheduledDate).toISOString().slice(0, 10)}|${event.title}`, event]));
  const desiredKeys = new Set();
  const keepIds = new Set();
  const toCreate = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    if (selectedDayNumbers.includes(currentDate.getDay())) {
      const dateKey = currentDate.toISOString().slice(0, 10);
      for (const activity of plan.activities) {
        const key = `${dateKey}|${activity.title}`;
        desiredKeys.add(key);
        const existing = byKey.get(key);
        if (existing) {
          existing.estimatedMinutes = activity.estimatedMinutes || 30;
          existing.goal = plan.goal;
          keepIds.add(String(existing._id));
          await existing.save();
        } else {
          toCreate.push({
            user: plan.user,
            plan: plan._id,
            goal: plan.goal,
            title: activity.title,
            estimatedMinutes: activity.estimatedMinutes || 30,
            scheduledDate: new Date(currentDate),
            status: 'upcoming',
          });
        }
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const deletableIds = candidates.filter((event) => !desiredKeys.has(`${new Date(event.scheduledDate).toISOString().slice(0, 10)}|${event.title}`) && !keepIds.has(String(event._id))).map((event) => event._id);
  if (deletableIds.length) await Event.deleteMany({ _id: { $in: deletableIds }, user: plan.user });
  if (toCreate.length) await Event.insertMany(toCreate);
}


async function updateReminderOverride(userId, planId, override) {
  const plan = await Plan.findOneAndUpdate(
    { _id: planId, user: userId },
    { reminderOverride: override },
    { new: true, runValidators: true }
  );

  if (!plan) {
    const error = new Error('Plan not found');
    error.statusCode = 404;
    throw error;
  }

  return plan;
}

module.exports = {
  createPlan,
  pausePlan,
  resumePlan,
  adjustSchedule,
  reconcileUpcomingEvents,
  updateReminderOverride,
  generateEventsFromPlan,
  autoResumeIfExpired,
  isPauseExpired,
  validateReturnDate,
};
