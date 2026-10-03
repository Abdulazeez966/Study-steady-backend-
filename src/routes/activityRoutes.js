const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware, activityController.startActivity);
router.put('/:id/complete', authMiddleware, activityController.completeActivity);
router.put('/:id/snooze', authMiddleware, activityController.snoozeActivity);
router.get('/', authMiddleware, activityController.getActivities);
router.get('/:id', authMiddleware, activityController.getActivityById);

module.exports = router;