const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const auth = require('../middlewares/auth');
const { upload } = require('../config/aws');

// @route   GET api/notes/subjects
// @desc    Get all subjects
// @access  Private
router.get('/subjects', auth, notesController.getAllSubjects);

// @route   POST api/notes/subjects
// @desc    Create a subject
// @access  Private
router.post('/subjects', auth, notesController.createSubject);

// @route   GET api/notes/subject/:subjectId
// @desc    Get notes by subject
// @access  Private
router.get('/subject/:subjectId', auth, notesController.getNotesBySubject);

// @route   GET api/notes/:id
// @desc    Get note by ID
// @access  Private
router.get('/:id', auth, notesController.getNoteById);

// @route   POST api/notes
// @desc    Create a note
// @access  Private
router.post('/', auth, notesController.createNote);

// @route   PUT api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', auth, notesController.updateNote);

// @route   DELETE api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, notesController.deleteNote);

// @route   POST api/notes/:id/upload
// @desc    Upload a file for a note
// @access  Private
router.post('/:id/upload', auth, upload.single('file'), notesController.uploadNoteFile);

module.exports = router;