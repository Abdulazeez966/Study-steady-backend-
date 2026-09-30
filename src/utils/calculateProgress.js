function calculatePercentComplete(totalEvents, completedActivities) {
  if (totalEvents === 0) return 0;
  return Math.round((completedActivities / totalEvents) * 100);
}

module.exports = { calculatePercentComplete };