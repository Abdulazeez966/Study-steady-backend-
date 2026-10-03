const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.get('/', controller.list);
router.put('/read-all', controller.markAllRead);
router.put('/:id/read', controller.markRead);

module.exports = router;
