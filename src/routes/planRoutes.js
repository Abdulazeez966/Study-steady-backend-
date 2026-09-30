const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, planController.createPlan);
router.get('/', authMiddleware, planController.getPlans);
router.get('/:id', authMiddleware, planController.getPlanById);
router.put('/:id', authMiddleware, planController.updatePlan);
router.delete('/:id', authMiddleware, planController.deletePlan);

// Flow D: pause / resume / adjust
router.put('/:id/pause', authMiddleware, planController.pausePlan);
router.put('/:id/resume', authMiddleware, planController.resumePlan);
router.put('/:id/adjust', authMiddleware, planController.adjustSchedule);
router.put('/:id/reminders', authMiddleware, planController.updateReminders);

module.exports = router;