const express = require('express');
const router = express.Router();
const { createRoom, getRoom, getRooms } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createRoom).get(protect, getRooms);
router.route('/:roomId').get(protect, getRoom);

module.exports = router;
