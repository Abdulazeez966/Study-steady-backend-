const mongoose = require('mongoose');

const reminderOverrideSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    days: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: [],
    },
    time: { type: String, default: null },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      required: true, // e.g. "Read Chapter 3" — one item from the Plan's activities list
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String, // 'HH:mm', optional if only a day is scheduled, not a specific time
      default: null,
    },
    estimatedMinutes: {
      type: Number, // how long this single occurrence is expected to take
      default: 30,
      min: 5,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'missed', 'snoozed'],
      default: 'upcoming',
    },
    paused: {
      type: Boolean, // task-level pause, independent of the Plan's own pause state
      default: false,
    },
    pauseReturnDate: {
      type: Date,
      default: null,
    },
    reminderOverride: {
      // task-level reminder override; null means "use the Plan's setting, or the account default"
      type: reminderOverrideSchema,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
