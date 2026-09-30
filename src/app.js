const express = require('express');
const cors = require('cors');

const authMiddleware = require("./middleware/authMiddleware");
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const goalRoutes = require('./routes/goalRoutes');
const planRoutes = require('./routes/planRoutes');
const eventRoutes = require('./routes/eventRoutes');
const activityRoutes = require('./routes/activityRoutes');
const progressRoutes = require('./routes/progressRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const recoveryRoutes = require('./routes/recoveryRoutes');

const app = express();

// Middleware
// Set CORS_ORIGINS to a comma-separated list in production, e.g.
// https://studysteady.netlify.app,https://www.studysteady.com
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server requests and local development when no allow-list is configured.
    if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));
app.use(express.json());

// Health check for Render/load balancers/monitoring.
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

// Public routes
app.use("/api/auth", authRoutes);

// Protected Routes
app.use('/api/courses', authMiddleware, courseRoutes);
app.use('/api/goals', authMiddleware, goalRoutes);
app.use('/api/plans', authMiddleware, planRoutes);
app.use('/api/events', authMiddleware, eventRoutes);
app.use('/api/activities', authMiddleware, activityRoutes);
app.use('/api/progress', authMiddleware, progressRoutes);
app.use('/api/reminders', authMiddleware, reminderRoutes);
app.use('/api/recovery', authMiddleware, recoveryRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;