const Note = require('../models/Note');
const Subject = require('../models/Subject');
const { s3 } = require('../config/aws');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create a subject
exports.createSubject = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newSubject = new Subject({
      name,
      description
    });

    const subject = await newSubject.save();
    res.json(subject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get notes by subject
exports.getNotesBySubject = async (req, res) => {
  try {
    const notes = await Note.find({ subject: req.params.subjectId })
                           .populate('subject', 'name');
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('subject', 'name');
    
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
};

// Create a note
exports.createNote = async (req, res) => {
  const { title, content, subject } = req.body;

  try {
    // Check if subject exists
    const subjectExists = await Subject.findById(subject);
    if (!subjectExists) {
      return res.status(404).json({ msg: 'Subject not found' });
    }

    const newNote = new Note({
      title,
      content,
      subject
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    let note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // Update fields
    note.title = title || note.title;
    note.content = content || note.content;
    
    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    // If note has an S3 key, delete from S3
    if (note.s3Key) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: note.s3Key
      };
      
      await s3.deleteObject(params).promise();
    }
    
    await note.remove();
    res.json({ msg: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Note not found' });
    }
    res.status(500).send('Server error');
  }
};

// Upload a note file to S3
exports.uploadNoteFile = async (req, res) => {
  try {
    // The file info is available in req.file after multer processes it
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Find the note and update with the S3 key
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }
    
    note.s3Key = file.key;
    await note.save();
    
    res.json({
      msg: 'File uploaded successfully',
      fileUrl: file.location,
      s3Key: file.key
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};