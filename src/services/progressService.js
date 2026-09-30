const Activity = require('../models/Activity');
const Event = require('../models/Event');
const { calculatePercentComplete } = require('../utils/calculateProgress');

async function calculateProgress(userId, planId) {
  const filter = { user: userId };
  if (planId) filter.plan = planId;

  const totalEvents = await Event.countDocuments(filter);
  const completedActivities = await Activity.countDocuments({
    ...filter,
    status: 'completed',
  });

  const percentComplete = calculatePercentComplete(totalEvents, completedActivities);

  return {
    totalEvents,
    completedActivities,
    percentComplete,
  };
}

async function getMissedSummary(userId, planId) {
  const filter = { user: userId, status: 'missed' };
  if (planId) filter.plan = planId;

  const missedActivities = await Activity.find(filter).sort({ createdAt: 1 });
  const count = missedActivities.length;

  let tier;
  let showList;
  let recommendedActivity = null;

  if (count === 0) {
    tier = 'none';
    showList = false;
  } else if (count <= 2) {
    tier = 'low';
    showList = true;
    recommendedActivity = missedActivities[0];
  } else if (count <= 5) {
    tier = 'medium';
    showList = false;
    recommendedActivity = missedActivities[0];
  } else {
    tier = 'high';
    showList = false;
  }

  return {
    count,
    tier,
    showList,
    activities: showList ? missedActivities : [],
    recommendedActivity,
    surfaceAdjustPlan: tier === 'high',
  };
}

module.exports = {
  calculateProgress,
  getMissedSummary,
};