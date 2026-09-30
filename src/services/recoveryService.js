const Activity = require('../models/Activity');

async function getRecoveryTask(userId, planId) {
  const filter = { user: userId, status: 'missed' };
  if (planId) filter.plan = planId;

  const recoveryTask = await Activity.findOne(filter).sort({ createdAt: 1 });

  return recoveryTask;
}

async function snoozeRecovery(userId, activityId) {
  const activity = await Activity.findOneAndUpdate(
    { _id: activityId, user: userId },
    { status: 'snoozed', snoozedAt: new Date() },
    { new: true }
  );

  if (!activity) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  return activity;
}

async function markRecovered(userId, activityId) {
  const activity = await Activity.findOneAndUpdate(
    { _id: activityId, user: userId },
    { status: 'recovered', completedAt: new Date() },
    { new: true }
  );

  if (!activity) {
    const error = new Error('Activity not found');
    error.statusCode = 404;
    throw error;
  }

  return activity;
}

module.exports = {
  getRecoveryTask,
  snoozeRecovery,
  markRecovered,
};