const Question = require('../models/Question');

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createQuestion = async (req, res) => {
  const { title, description, difficulty, testCases } = req.body;

  try {
    const question = await Question.create({
      title,
      description,
      difficulty,
      testCases
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(400).json({ message: 'Invalid question data', error: error.message });
  }
};

module.exports = {
  getQuestions,
  createQuestion
};
