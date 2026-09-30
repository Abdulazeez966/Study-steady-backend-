const User = require('../models/User');

// Flow C: "App open (≥7 days inactivity) → Dashboard (catch-up state)"
async function checkInactiveUsers() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const inactiveUsers = await User.find({
    lastActiveAt: { $lte: sevenDaysAgo },
  });

  console.log(`Found ${inactiveUsers.length} inactive user(s)`);

  // Note: this job just identifies inactive users.
  // The actual "catch-up state" is computed live when the user opens the
  // app (via progressService.getMissedSummary), not stored here — so this
  // job is only useful if you want to proactively notify inactive users
  // (e.g., trigger a reminder), not for the dashboard logic itself.

  return inactiveUsers;
}

module.exports = { checkInactiveUsers };