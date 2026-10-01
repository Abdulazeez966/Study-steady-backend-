const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/account', authMiddleware, authController.updateAccount);

module.exports = router;