const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, goalController.createGoal);
router.get('/', authMiddleware, goalController.getGoals);
router.get('/:id', authMiddleware, goalController.getGoalById);
router.put('/:id', authMiddleware, goalController.updateGoal);
router.delete('/:id', authMiddleware, goalController.deleteGoal);

module.exports = router;