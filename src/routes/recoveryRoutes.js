const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/task', authMiddleware, recoveryController.getRecoveryTask);
router.put('/:id/snooze', authMiddleware, recoveryController.snoozeRecovery);
router.put('/:id/recover', authMiddleware, recoveryController.markRecovered);

module.exports = router;