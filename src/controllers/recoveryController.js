const recoveryService = require('../services/recoveryService');

async function getRecoveryTask(req, res, next) {
  try {
    const userId = req.user.id;
    const { planId } = req.query;

    const task = await recoveryService.getRecoveryTask(userId, planId);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

async function snoozeRecovery(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await recoveryService.snoozeRecovery(userId, id);

    res.status(200).json({
      success: true,
      message: 'Recovery task snoozed',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

async function markRecovered(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const activity = await recoveryService.markRecovered(userId, id);

    res.status(200).json({
      success: true,
      message: 'Recovery task completed',
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecoveryTask,
  snoozeRecovery,
  markRecovered,
};