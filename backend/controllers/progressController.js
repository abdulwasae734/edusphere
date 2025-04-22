const Progress = require('../models/Progress');
const Subject = require('../models/Subject');
const Note = require('../models/Note');

// Get user progress for all subjects
exports.getUserProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user.id })
                                  .populate('subject', 'name')
                                  .populate('notesCompleted', 'title')
                                  .populate('quizResults.quiz', 'title');
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get user progress for a specific subject
exports.getSubjectProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user.id,
      subject: req.params.subjectId
    })
    .populate('subject', 'name')
    .populate('notesCompleted', 'title')
    .populate('quizResults.quiz', 'title');
    
    if (!progress) {
      // Create a new progress record if none exists
      const subjectExists = await Subject.findById(req.params.subjectId);
      if (!subjectExists) {
        return res.status(404).json({ msg: 'Subject not found' });
      }
      
      const newProgress = new Progress({
        user: req.user.id,
        subject: req.params.subjectId,
        notesCompleted: [],
        quizResults: []
      });
      
      await newProgress.save();
      
      // Fetch the populated version
      const populatedProgress = await Progress.findById(newProgress._id)
                                            .populate('subject', 'name')
                                            .populate('notesCompleted', 'title')
                                            .populate('quizResults.quiz', 'title');
      
      return res.json(populatedProgress);
    }
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Mark a note as completed
exports.markNoteCompleted = async (req, res) => {
  try {
    // Check if note exists
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    let progress = await Progress.findOne({
      user: req.user.id,
      subject: note.subject
    });
    
    if (!progress) {
      progress = new Progress({
        user: req.user.id,
        subject: note.subject,
        notesCompleted: [req.params.noteId],
        quizResults: []
      });
    } else if (!progress.notesCompleted.includes(req.params.noteId)) {
      progress.notesCompleted.push(req.params.noteId);
    }
    
    progress.lastAccessed = Date.now();
    await progress.save();
    
    const populatedProgress = await Progress.findById(progress._id)
                                          .populate('subject', 'name')
                                          .populate('notesCompleted', 'title')
                                          .populate('quizResults.quiz', 'title');
    
    res.json(populatedProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Unmark a note as completed
exports.unmarkNoteCompleted = async (req, res) => {
  try {
    let progress = await Progress.findOne({
      user: req.user.id,
      'notesCompleted': req.params.noteId
    });
    
    if (!progress) {
      return res.status(404).json({ msg: 'No progress record found with this note' });
    }
    
    // Remove note from completed list
    progress.notesCompleted = progress.notesCompleted.filter(
      noteId => noteId.toString() !== req.params.noteId
    );
    
    progress.lastAccessed = Date.now();
    await progress.save();
    
    const populatedProgress = await Progress.findById(progress._id)
                                          .populate('subject', 'name')
                                          .populate('notesCompleted', 'title')
                                          .populate('quizResults.quiz', 'title');
    
    res.json(populatedProgress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};