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

const planActivitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // e.g. "Read Chapter 3"
      trim: true,
    },
    estimatedMinutes: {
      type: Number, // how long this activity is expected to take, drives the frontend's time-budget feature
      default: 30,
      min: 5,
    },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
    },
    activities: {
      type: [planActivitySchema], // Flow A: "No activities added → error"
      default: [],
    },
    weeklyTime: {
      type: String, // free-text pace, e.g. "3 hours" — matches the frontend's weekly-time selector
      trim: true,
      default: '',
    },
    daysOfWeek: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: [], // Flow A: "No days selected → error"
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null, // Flow D: "Plan end date passed → adjustment option surfaced"
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
    pausedUntil: {
      type: Date,
      default: null, // Flow D: pause with a return date
    },
    reminderOverride: {
      // course-level reminder override; null means "use the account default"
      type: reminderOverrideSchema,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
