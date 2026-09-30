const Activity = require('../models/Activity');
const Event = require('../models/Event');

// Create an Activity record when a student starts a scheduled Event
async function startActivity(req, res, next) {
  try {
    const userId = req.user.id;
    const { eventId } = req.body;

    const event = await Event.findOne({ _id: eventId, user: userId });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Flow B: "Mark In Progress but not completed → stays as today's task"
    let activity = await Activity.findOne({ event: eventId, user: userId });

    if (!activity) {
      activity = await Activity.create({
        user: userId,
        event: event._id,
        plan: event.plan,
        goal: event.goal,
        title: event.title,
        status: 'in_progress',
      });
    } else {
      activity.status = 'in_progress';
      await activity.save();
    }

    res.status(200).json({
      success: true,
      message: 'Activity marked as in progress',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

// Flow B: Mark Completed
async function completeActivity(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    // Keep the linked Event in sync
    await Event.findByIdAndUpdate(activity.event, { status: 'completed' });

    res.status(200).json({
      success: true,
      message: 'Activity marked as completed',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

// Flow C: Dismiss banner → session snooze only (not permanent)
async function snoozeActivity(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findOneAndUpdate(
      { _id: id, user: userId },
      { status: 'snoozed', snoozedAt: new Date() },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Activity snoozed',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

async function getActivities(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, planId } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;
    if (planId) filter.plan = planId;

    const activities = await Activity.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
}

async function getActivityById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await Activity.findOne({ _id: id, user: userId });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startActivity,
  completeActivity,
  snoozeActivity,
  getActivities,
  getActivityById,
};