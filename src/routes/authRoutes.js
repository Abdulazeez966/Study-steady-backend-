const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/account', authMiddleware, authController.deleteAccount);
router.post('/presence', authMiddleware, authController.updatePresence);

module.exports = router;