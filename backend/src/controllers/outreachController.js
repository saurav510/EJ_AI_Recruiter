const OutreachMessage = require('../models/OutreachMessage');
const CandidateMatch = require('../models/CandidateMatch');
const Resume = require('../models/Resume');
const { generateOutreachMessages } = require('../services/outreachService');

// @desc    Generate outreach messages
// @route   POST /api/outreach/generate
// @access  Public
const generateOutreach = async (req, res) => {
  const { matchId, resumeId, candidateName, jobTitle, companyName, matchScore } = req.body;

  if (!candidateName || !jobTitle) {
    return res.status(400).json({ success: false, error: 'candidateName and jobTitle are required.' });
  }

  const generatedMessages = await generateOutreachMessages({
    candidateName, jobTitle, companyName, matchScore
  });

  const outreachDoc = new OutreachMessage({
    matchId: matchId || null,
    resumeId: resumeId || null,
    candidateName,
    jobTitle,
    companyName: companyName || '',
    matchScore: matchScore || null,
    whatsappMessage: generatedMessages.whatsappMessage,
    followUpMessage: generatedMessages.followUpMessage,
    emailMessage: generatedMessages.emailMessage,
  });

  await outreachDoc.save();

  res.status(201).json({ success: true, data: outreachDoc });
};

// @desc    Get outreach history (paginated)
// @route   GET /api/outreach/history
// @access  Public
const getHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    OutreachMessage.find()
      .select('candidateName jobTitle matchScore whatsappCopied emailCopied followUpCopied createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OutreachMessage.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: records,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

// @desc    Get single outreach by ID
// @route   GET /api/outreach/:id
// @access  Public
const getOutreachById = async (req, res) => {
  const record = await OutreachMessage.findById(req.params.id);

  if (!record) {
    return res.status(404).json({ success: false, error: 'Outreach record not found.' });
  }

  res.status(200).json({ success: true, data: record });
};

// @desc    Track copy event
// @route   PATCH /api/outreach/:id/copy
// @access  Public
const trackCopy = async (req, res) => {
  const { channel } = req.body;
  if (!['whatsapp', 'email', 'followup'].includes(channel)) {
    return res.status(400).json({ success: false, error: 'Invalid channel specified.' });
  }

  const record = await OutreachMessage.findById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Outreach record not found.' });
  }

  if (channel === 'whatsapp') record.whatsappCopied += 1;
  if (channel === 'email') record.emailCopied += 1;
  if (channel === 'followup') record.followUpCopied += 1;

  await record.save();

  res.status(200).json({ success: true, message: `Analytics updated for ${channel}.` });
};

// @desc    Delete outreach
// @route   DELETE /api/outreach/:id
// @access  Public
const deleteOutreach = async (req, res) => {
  const record = await OutreachMessage.findByIdAndDelete(req.params.id);

  if (!record) {
    return res.status(404).json({ success: false, error: 'Outreach record not found.' });
  }

  res.status(200).json({ success: true, message: 'Outreach record deleted successfully.' });
};

module.exports = { generateOutreach, getHistory, getOutreachById, trackCopy, deleteOutreach };
