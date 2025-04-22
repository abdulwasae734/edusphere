const Quiz = require('../models/Quiz');
const Subject = require('../models/Subject');
const Progress = require('../models/Progress');

// Get quizzes by subject
exports.getQuizzesBySubject = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ subject: req.params.subjectId })
                             .populate('subject', 'name');
    res.json(quizzes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('subject', 'name');
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a quiz
exports.createQuiz = async (req, res) => {
  const { title, subject, questions } = req.body;

  try {
    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ msg: 'Subject not found' });
    }

    const newQuiz = new Quiz({
      title,
      subject,
      questions
    });

    const quiz = await newQuiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a quiz
exports.updateQuiz = async (req, res) => {
  const { title, questions } = req.body;

  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Update fields
    quiz.title = title || quiz.title;
    if (questions) quiz.questions = questions;
    
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    await quiz.remove();
    
    // Also remove any quiz results from progress
    await Progress.updateMany(
      { 'quizResults.quiz': req.params.id },
      { $pull: { quizResults: { quiz: req.params.id } } }
    );
    
    res.json({ msg: 'Quiz removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    res.status(500).send('Server error');
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  const { answers } = req.body;
  
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // Calculate score
    let correctAnswers = 0;
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / quiz.questions.length) * 100;
    
    // Update user progress
    let progress = await Progress.findOne({
      user: req.user.id,
      subject: quiz.subject
    });
    
    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        subject: quiz.subject,
        notesCompleted: [],
        quizResults: []
      });
    }
    
    // Check if quiz already taken
    const quizIndex = progress.quizResults.findIndex(
      result => result.quiz.toString() === req.params.id
    );
    
    if (quizIndex !== -1) {
      // Update existing result
      progress.quizResults[quizIndex].score = score;
      progress.quizResults[quizIndex].date = Date.now();
    } else {
      // Add new result
      progress.quizResults.push({
        quiz: req.params.id,
        score
      });
    }
    
    progress.lastAccessed = Date.now();
    await progress.save();
    
    res.json({
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};