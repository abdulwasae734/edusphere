const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const auth = require('../middlewares/auth');

// @route   GET api/progress
// @desc    Get user progress for all subjects
// @access  Private
router.get('/', auth, progressController.getUserProgress);

// @route   GET api/progress/subject/:subjectId
// @desc    Get user progress for a specific subject
// @access  Private
router.get('/subject/:subjectId', auth, progressController.getSubjectProgress);

// @route   PUT api/progress/note/:noteId/complete
// @desc    Mark a note as completed
// @access  Private
router.put('/note/:noteId/complete', auth, progressController.markNoteCompleted);

// @route   PUT api/progress/note/:noteId/uncomplete
// @desc    Unmark a note as completed
// @access  Private
router.put('/note/:noteId/uncomplete', auth, progressController.unmarkNoteCompleted);

module.exports = router;