const progressService = require('../services/progressService');

async function getProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const { planId } = req.query;

    const progress = await progressService.calculateProgress(userId, planId);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
}

// Flow C: 6+ missed → count only, do NOT show full list
async function getMissedSummary(req, res, next) {
  try {
    const userId = req.user.id;
    const { planId } = req.query;

    const summary = await progressService.getMissedSummary(userId, planId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProgress,
  getMissedSummary,
};