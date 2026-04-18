const express = require('express');
const router = express.Router();
const { getQuestions, createQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getQuestions).post(protect, createQuestion);

module.exports = router;
