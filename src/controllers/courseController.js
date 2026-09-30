const courseService = require('../services/courseService');

async function createCourse(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, description, provider, targetDate, activities, weeklyTime, daysOfWeek, startDate, endDate } = req.body;
    const course = await courseService.createCourse(userId, {
      title,
      description,
      provider,
      targetDate,
      activities,
      weeklyTime,
      daysOfWeek,
      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createCourse };
