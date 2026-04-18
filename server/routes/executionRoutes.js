const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, executeCode);

module.exports = router;
