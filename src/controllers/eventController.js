const eventService = require('../services/eventService');

async function getEvents(req, res, next) {
  try {
    const userId = req.user.id;
    const { date, planId, goalId } = req.query;

    const events = await eventService.listEvents(userId, { date, planId, goalId });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

async function getEventById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const event = await eventService.getEventById(userId, id);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

async function updateEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { scheduledDate, estimatedMinutes, scheduledTime, title } = req.body;

    const event = await eventService.updateEvent(userId, id, { scheduledDate, estimatedMinutes, scheduledTime, title });

    res.status(200).json({
      success: true,
      message: 'Event updated',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await eventService.deleteEvent(userId, id);

    res.status(200).json({
      success: true,
      message: 'Event deleted',
    });
  } catch (error) {
    next(error);
  }
}

async function pauseEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { returnDate } = req.body;

    const event = await eventService.pauseEvent(userId, id, returnDate);

    res.status(200).json({
      success: true,
      message: 'Activity paused',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

async function resumeEvent(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const event = await eventService.resumeEvent(userId, id);

    res.status(200).json({
      success: true,
      message: 'Activity resumed',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

async function updateReminders(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { enabled, days, time, clear } = req.body;

    const override = clear ? null : { enabled, days, time };
    const event = await eventService.updateReminderOverride(userId, id, override);

    res.status(200).json({
      success: true,
      message: clear ? 'Activity reminder override cleared' : 'Activity reminder override saved',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  pauseEvent,
  resumeEvent,
  updateReminders,
};
