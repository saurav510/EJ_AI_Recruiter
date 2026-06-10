const Resume = require('../models/Resume');
const { extractText, parseResumeWithGemini } = require('../services/resumeService');

// @desc    Upload and parse a resume
// @route   POST /api/resume/parse
// @access  Public
const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Resume file is required.' });
  }

  const { buffer, originalname, mimetype, size } = req.file;
  const ext = originalname.split('.').pop().toLowerCase();

  // Step 1: Extract text
  const extractedText = await extractText(buffer, mimetype);

  // Step 2: Parse with Gemini
  const parsedResult = await parseResumeWithGemini(extractedText);

  // Step 3: Save to MongoDB
  const resume = new Resume({
    originalFileName: originalname,
    fileType: ext,
    fileSize: size,
    parsedResult,
    extractedText,
  });
  await resume.save();

  res.status(201).json({
    success: true,
    data: {
      id: resume._id,
      originalFileName: resume.originalFileName,
      fileType: resume.fileType,
      fileSize: resume.fileSize,
      parsedResult: resume.parsedResult,
      createdAt: resume.createdAt,
    },
  });
};

// @desc    Get all parsed resumes (paginated)
// @route   GET /api/resume/history
// @access  Public
const getResumeHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find()
      .select(
        'originalFileName fileType fileSize parsedResult.candidateName parsedResult.currentRole parsedResult.currentCompany parsedResult.experienceYears parsedResult.location createdAt'
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Resume.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: resumes,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

// @desc    Get single resume by ID
// @route   GET /api/resume/:id
// @access  Public
const getResumeById = async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      error: 'Resume not found.',
    });
  }

  res.status(200).json({ success: true, data: resume });
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:id
// @access  Public
const deleteResume = async (req, res) => {
  const resume = await Resume.findByIdAndDelete(req.params.id);

  if (!resume) {
    return res.status(404).json({
      success: false,
      error: 'Resume not found.',
    });
  }

  res.status(200).json({ success: true, message: 'Resume deleted successfully.' });
};

module.exports = { parseResume, getResumeHistory, getResumeById, deleteResume };
