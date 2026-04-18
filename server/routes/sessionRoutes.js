const express = require('express');
const router = express.Router();
const { getSession, updateSessionNotes, endSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:roomId', protect, getSession);
router.patch('/:roomId/notes', protect, updateSessionNotes);
router.post('/:roomId/end', protect, endSession);

module.exports = router;
