const mongoose = require('mongoose');

const reminderPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one preference record per user
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    days: {
      type: [String], // e.g. ['Monday', 'Wednesday', 'Friday']
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: [],
    },
    time: {
      type: String, // stored as 'HH:mm' (24hr), e.g. '18:30'
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReminderPreference', reminderPreferenceSchema);