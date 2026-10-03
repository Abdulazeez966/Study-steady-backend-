const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    reminderPeriod: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], required: true },
    dedupeKey: { type: String, required: true, unique: true, index: true },
    readAt: { type: Date, default: null },
    emailSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
