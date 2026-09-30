const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, reminderController.getReminderSettings);
router.put('/', authMiddleware, reminderController.updateReminderSettings);

module.exports = router;