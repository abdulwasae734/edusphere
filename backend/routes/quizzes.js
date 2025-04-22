const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middlewares/auth');

// @route   GET api/quizzes/subject/:subjectId
// @desc    Get quizzes by subject
// @access  Private
router.get('/subject/:subjectId', auth, quizController.getQuizzesBySubject);

// @route   GET api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', auth, quizController.getQuizById);

// @route   POST api/quizzes
// @desc    Create a quiz
// @access  Private
router.post('/', auth, quizController.createQuiz);

// @route   PUT api/quizzes/:id
// @desc    Update a quiz
// @access  Private
router.put('/:id', auth, quizController.updateQuiz);

// @route   DELETE api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', auth, quizController.deleteQuiz);

// @route   POST api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:id/submit', auth, quizController.submitQuiz);

module.exports = router;