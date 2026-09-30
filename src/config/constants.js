// Reminder days (shared with ReminderPreference model)
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Activity status — tracks whether a scheduled task was done, missed, or snoozed (Flow B & C)
const ACTIVITY_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  MISSED: 'missed',
  SNOOZED: 'snoozed',
  RECOVERED: 'recovered',
};

// Missed-count thresholds for catch-up UI logic (Flow C)
const MISSED_THRESHOLDS = {
  LOW: { min: 1, max: 2 },   // show individually, recommend first
  MEDIUM: { min: 3, max: 5 }, // count, collapse, recommend one
  HIGH: { min: 6, max: Infinity }, // count only, surface Adjust Plan
};

// Plan status (Flow D — pause/resume/adjust)
const PLAN_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

module.exports = {
  DAYS_OF_WEEK,
  ACTIVITY_STATUS,
  MISSED_THRESHOLDS,
  PLAN_STATUS,
};