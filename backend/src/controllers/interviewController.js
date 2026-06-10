const InterviewSession = require('../models/InterviewSession');
const JobAnalysis = require('../models/JobAnalysis');
const Resume = require('../models/Resume');
const CandidateMatch = require('../models/CandidateMatch');
const { generateInterviewQuestions } = require('../services/interviewService');

const validateInput = (req, res) => {
  const { jdId, resumeId, matchId, jobData, candidateData, matchData } = req.body;
  const hasIds = jdId && resumeId;
  const hasRaw = jobData && candidateData;

  if (!hasIds && !hasRaw) {
    res.status(400).json({
      success: false,
      error: 'Provide (jdId + resumeId) with optional matchId, or (jobData + candidateData) with optional matchData.',
    });
    return false;
  }
  return true;
};

// @desc    Generate interview questions
// @route   POST /api/interview/questions
// @access  Public
const generateQuestions = async (req, res) => {
  if (!validateInput(req, res)) return;

  const {
    jdId, resumeId, matchId,
    jobData: rawJobData, candidateData: rawCandidateData, matchData: rawMatchData,
  } = req.body;

  let jobData, candidateData, matchData;
  let resolvedJdId, resolvedResumeId, resolvedMatchId;

  if (jdId && resumeId) {
    const fetches = [JobAnalysis.findById(jdId), Resume.findById(resumeId)];
    if (matchId) fetches.push(CandidateMatch.findById(matchId));

    const results = await Promise.all(fetches);
    const [jdDoc, resumeDoc, matchDoc] = results;

    if (!jdDoc) return res.status(404).json({ success: false, error: 'Job Description not found.' });
    if (!resumeDoc) return res.status(404).json({ success: false, error: 'Resume not found.' });

    jobData = jdDoc.parsedResult.toObject();
    candidateData = resumeDoc.parsedResult.toObject();
    matchData = matchDoc ? matchDoc.matchResult.toObject() : null;
    resolvedJdId = jdId;
    resolvedResumeId = resumeId;
    resolvedMatchId = matchId || null;
  } else {
    jobData = rawJobData;
    candidateData = rawCandidateData;
    matchData = rawMatchData || null;
  }

  const { technicalQuestions, behavioralQuestions, scenarioQuestions, skillGapQuestions } =
    await generateInterviewQuestions(jobData, candidateData, matchData || {});

  const session = new InterviewSession({
    jdId: resolvedJdId || null,
    resumeId: resolvedResumeId || null,
    matchId: resolvedMatchId || null,
    jobTitle: jobData.jobTitle || '',
    candidateName: candidateData.candidateName || '',
    seniorityLevel: jobData.seniorityLevel || '',
    technicalQuestions,
    behavioralQuestions,
    scenarioQuestions,
    skillGapQuestions,
  });
  await session.save();

  res.status(201).json({
    success: true,
    data: {
      id: session._id,
      jobTitle: session.jobTitle,
      candidateName: session.candidateName,
      seniorityLevel: session.seniorityLevel,
      totalQuestions: session.totalQuestions,
      technicalQuestions,
      behavioralQuestions,
      scenarioQuestions,
      skillGapQuestions,
      createdAt: session.createdAt,
    },
  });
};

// @desc    Get session history (paginated)
// @route   GET /api/interview/history
// @access  Public
const getHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    InterviewSession.find()
      .select('candidateName jobTitle seniorityLevel totalQuestions createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    InterviewSession.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: sessions,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

// @desc    Get single session
// @route   GET /api/interview/:id
// @access  Public
const getSessionById = async (req, res) => {
  const session = await InterviewSession.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Interview session not found.' });
  }
  res.status(200).json({ success: true, data: session });
};

// @desc    Delete session
// @route   DELETE /api/interview/:id
// @access  Public
const deleteSession = async (req, res) => {
  const session = await InterviewSession.findByIdAndDelete(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Interview session not found.' });
  }
  res.status(200).json({ success: true, message: 'Session deleted successfully.' });
};

module.exports = { generateQuestions, getHistory, getSessionById, deleteSession };
