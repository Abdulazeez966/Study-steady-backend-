const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Plan = require('../models/Plan');
const Event = require('../models/Event');
const Activity = require('../models/Activity');
const ReminderPreference = require('../models/ReminderPreference');
const Notification = require('../models/Notification');

/**
 * Permanently deletes the authenticated user's account and all first-party
 * StudySteady records owned by that user.
 *
 * Password confirmation is required so a stolen/old bearer token alone
 * cannot immediately delete an account.
 */
async function deleteAccount(userId, password) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('Account not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password || '', user.password);
  if (!isMatch) {
    const error = new Error('Incorrect password');
    error.statusCode = 401;
    throw error;
  }

  // Delete dependent records first. All of these models contain a `user`
  // field, so this also removes data that would otherwise be orphaned.
  await Promise.all([
    Activity.deleteMany({ user: userId }),
    Event.deleteMany({ user: userId }),
    Plan.deleteMany({ user: userId }),
    Goal.deleteMany({ user: userId }),
    ReminderPreference.deleteMany({ user: userId }),
    Notification.deleteMany({ user: userId }),
  ]);

  await User.deleteOne({ _id: userId });
}

module.exports = { deleteAccount };
