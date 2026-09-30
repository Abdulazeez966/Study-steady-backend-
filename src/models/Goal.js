const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true, // e.g. "Mathematics", "Chemistry" — Flow A: "Goal field empty → error"
      trim: true,
    },
    description: {
      type: String, // optional extra detail, e.g. "Master quadratic equations"
      trim: true,
      default: '',
    },
    provider: {
      type: String, // e.g. "Udemy", "Coursera", "Betechified" — where this goal is actually studied
      trim: true,
      default: '',
    },
    targetDate: {
      type: Date, // optional — not every goal may have a deadline
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);