const Plan = require('../models/Plan');
const planService = require('../services/planService');

async function createPlan(req, res, next) {
  try {
    const userId = req.user.id;
    const { goal, activities, weeklyTime, daysOfWeek, startDate, endDate } = req.body;

    const plan = await planService.createPlan(userId, { goal, activities, weeklyTime, daysOfWeek, startDate, endDate });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

async function getPlans(req, res, next) {
  try {
    const userId = req.user.id;

    const plans = await Plan.find({ user: userId }).sort({ createdAt: -1 });
    await Promise.all(plans.map((plan) => planService.autoResumeIfExpired(plan)));

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
}

async function getPlanById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await Plan.findOne({ _id: id, user: userId });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    await planService.autoResumeIfExpired(plan);

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

async function updatePlan(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { activities, weeklyTime, daysOfWeek, startDate, endDate } = req.body;

    if (activities !== undefined && activities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one activity',
      });
    }

    if (daysOfWeek !== undefined && daysOfWeek.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one day',
      });
    }

    const plan = await Plan.findOneAndUpdate(
      { _id: id, user: userId },
      { activities, weeklyTime, daysOfWeek, startDate, endDate },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

async function pausePlan(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { returnDate } = req.body;

    const plan = await planService.pausePlan(userId, id, returnDate);

    res.status(200).json({
      success: true,
      message: 'Plan paused',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

async function resumePlan(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await planService.resumePlan(userId, id);

    res.status(200).json({
      success: true,
      message: 'Plan resumed',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

async function adjustSchedule(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { daysOfWeek, activities, weeklyTime, endDate } = req.body;

    const plan = await planService.adjustSchedule(userId, id, { daysOfWeek, activities, weeklyTime, endDate });

    res.status(200).json({
      success: true,
      message: 'Plan schedule updated',
      data: plan,
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
    const plan = await planService.updateReminderOverride(userId, id, override);

    res.status(200).json({
      success: true,
      message: clear ? 'Course reminder override cleared — using the account default' : 'Course reminder override saved',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
}

async function deletePlan(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await Plan.findOneAndDelete({ _id: id, user: userId });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  pausePlan,
  resumePlan,
  adjustSchedule,
  updateReminders,
  deletePlan,
};
