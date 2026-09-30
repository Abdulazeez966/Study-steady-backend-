const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event', // links back to the scheduled instance this activity fulfills
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    title: {
      type: String,
      required: true, // copied from Event at completion time, e.g. "Read Chapter 3"
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'missed', 'snoozed', 'recovered'],
      default: 'in_progress',
      // Flow B: "Mark In Progress but not completed → stays as today's task"
      // Flow C: missed/snoozed/recovered states
    },
    completedAt: {
      type: Date,
      default: null,
    },
    snoozedAt: {
      type: Date,
      default: null, // Flow C: "Dismiss banner → session snooze only (not permanent)"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);