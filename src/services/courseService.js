const Goal = require('../models/Goal');
const Plan = require('../models/Plan');
const Event = require('../models/Event');
const planService = require('./planService');

async function createCourse(userId, { title, description, provider, targetDate, activities, weeklyTime, daysOfWeek, startDate, endDate }) {
  if (!title || !title.trim()) {
    const error = new Error('Goal subject is required');
    error.statusCode = 400;
    throw error;
  }

  if (!activities || activities.length === 0) {
    const error = new Error('Please add at least one activity');
    error.statusCode = 400;
    throw error;
  }

  if (!daysOfWeek || daysOfWeek.length === 0) {
    const error = new Error('Please select at least one day');
    error.statusCode = 400;
    throw error;
  }

  let goal;
  let plan;

  try {
    goal = await Goal.create({
      user: userId,
      subject: title.trim(),
      description,
      provider,
      targetDate,
    });

    plan = await Plan.create({
      user: userId,
      goal: goal._id,
      activities,
      weeklyTime,
      daysOfWeek,
      startDate: startDate || new Date(),
      endDate,
    });

    await planService.generateEventsFromPlan(plan);
    return { goal, plan };
  } catch (error) {
    if (plan) {
      await Event.deleteMany({ plan: plan._id });
      await Plan.deleteOne({ _id: plan._id, user: userId });
    }
    if (goal) {
      await Goal.deleteOne({ _id: goal._id, user: userId });
    }
    throw error;
  }
}

module.exports = { createCourse };
