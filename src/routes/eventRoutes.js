const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, eventController.getEvents);
router.get('/:id', authMiddleware, eventController.getEventById);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.put('/:id/pause', authMiddleware, eventController.pauseEvent);
router.put('/:id/resume', authMiddleware, eventController.resumeEvent);
router.put('/:id/reminders', authMiddleware, eventController.updateReminders);

module.exports = router;
