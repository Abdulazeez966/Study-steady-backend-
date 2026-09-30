const Goal = require('../models/Goal');

async function createGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { subject, description, provider, targetDate } = req.body;

    // Flow A: "Goal field empty → error"
    if (!subject || subject.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Goal subject is required',
      });
    }

    const goal = await Goal.create({
      user: userId,
      subject,
      description,
      provider,
      targetDate,
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

async function getGoals(req, res, next) {
  try {
    const userId = req.user.id;

    const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
}

async function getGoalById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const goal = await Goal.findOne({ _id: id, user: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { subject, description, provider, targetDate, status } = req.body;

    if (subject !== undefined && subject.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Goal subject cannot be empty',
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, user: userId },
      { subject, description, provider, targetDate, status },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal updated',
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, user: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};