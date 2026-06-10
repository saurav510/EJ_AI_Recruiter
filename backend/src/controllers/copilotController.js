const CopilotSession = require('../models/CopilotSession');
const CandidateMatch = require('../models/CandidateMatch');
const { chatWithCopilot } = require('../services/copilotService');

// @desc    Start a new Copilot Session
// @route   POST /api/copilot/start
// @access  Public
const startSession = async (req, res) => {
  const { matchId } = req.body;
  if (!matchId) return res.status(400).json({ success: false, error: 'matchId is required to start a session.' });

  const matchDoc = await CandidateMatch.findById(matchId);
  if (!matchDoc) return res.status(404).json({ success: false, error: 'Match Analysis not found.' });

  const session = new CopilotSession({
    matchId,
    candidateName: matchDoc.candidateSnapshot?.candidateName || 'Unknown',
    jobTitle: matchDoc.jobSnapshot?.jobTitle || 'Unknown',
    messages: [{
      role: 'model',
      content: `Hi! I'm your AI Recruiter Copilot. I've reviewed the match between **${matchDoc.candidateSnapshot?.candidateName}** and the **${matchDoc.jobSnapshot?.jobTitle}** role (Score: ${matchDoc.matchResult?.overallScore}/100).\n\nWhat would you like to know?`,
      timestamp: new Date(),
    }],
  });

  await session.save();

  res.status(201).json({ success: true, data: session });
};

// @desc    Send a message to Copilot
// @route   POST /api/copilot/:id/message
// @access  Public
const sendMessage = async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ success: false, error: 'Message cannot be empty.' });

  const session = await CopilotSession.findById(req.params.id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

  const matchDoc = await CandidateMatch.findById(session.matchId);
  if (!matchDoc) return res.status(404).json({ success: false, error: 'Underlying match context no longer exists.' });

  // Append user message
  session.messages.push({ role: 'user', content: message, timestamp: new Date() });
  await session.save();

  // Call Gemini
  const aiResponse = await chatWithCopilot(matchDoc, session.messages.slice(0, -1), message);

  // Append AI response
  session.messages.push({ role: 'model', content: aiResponse, timestamp: new Date() });
  await session.save();

  res.status(200).json({ success: true, data: session });
};

// @desc    Get Copilot history
// @route   GET /api/copilot/history
// @access  Public
const getHistory = async (req, res) => {
  const sessions = await CopilotSession.find()
    .select('matchId candidateName jobTitle updatedAt')
    .sort({ updatedAt: -1 });
  
  res.status(200).json({ success: true, data: sessions });
};

// @desc    Get specific Copilot session
// @route   GET /api/copilot/:id
// @access  Public
const getSession = async (req, res) => {
  const session = await CopilotSession.findById(req.params.id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });

  res.status(200).json({ success: true, data: session });
};

// @desc    Delete Copilot session
// @route   DELETE /api/copilot/:id
// @access  Public
const deleteSession = async (req, res) => {
  const session = await CopilotSession.findByIdAndDelete(req.params.id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found.' });
  
  res.status(200).json({ success: true, message: 'Session deleted successfully.' });
};

module.exports = { startSession, sendMessage, getHistory, getSession, deleteSession };
