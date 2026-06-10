const CandidateMatch = require('../models/CandidateMatch');
const JobAnalysis = require('../models/JobAnalysis');
const Resume = require('../models/Resume');
const { matchCandidateWithGemini } = require('../services/matchService');

// ── Validation helper ─────────────────────────────────────────────────────────
const validateMatchInput = (req, res) => {
  const { jdId, resumeId, jobData, resumeData } = req.body;

  const hasIds = jdId && resumeId;
  const hasRawData = jobData && resumeData;

  if (!hasIds && !hasRawData) {
    res.status(400).json({
      success: false,
      error:
        'Provide either (jdId + resumeId) to match stored analyses, or (jobData + resumeData) as raw objects.',
    });
    return false;
  }
  return true;
};

// @desc    Match candidate resume against JD
// @route   POST /api/match/candidate
// @access  Public
const matchCandidate = async (req, res) => {
  const { jdId, resumeId } = req.body;

  if (!jdId || !resumeId) {
    return res.status(400).json({ success: false, error: 'Both jdId and resumeId are required.' });
  }

  const [jobAnalysis, parsedResume] = await Promise.all([
    JobAnalysis.findById(jdId),
    Resume.findById(resumeId)
  ]);

  if (!jobAnalysis) return res.status(404).json({ success: false, error: 'Job Analysis not found.' });
  if (!parsedResume) return res.status(404).json({ success: false, error: 'Parsed Resume not found.' });

  const jobData = jobAnalysis.parsedResult;
  const resumeData = parsedResume.parsedResult;

  const matchResult = await matchCandidateWithGemini(jobData, resumeData);

  const candidateMatch = new CandidateMatch({
    jobAnalysisId: jdId,
    parsedResumeId: resumeId,
    jobSnapshot: jobData,
    candidateSnapshot: resumeData,
    matchResult,
  });

  await candidateMatch.save();

  res.status(201).json({
    success: true,
    data: candidateMatch,
  });
};

// @desc    Get match history (paginated)
// @route   GET /api/match/history
// @access  Public
const getMatchHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [matches, total] = await Promise.all([
    CandidateMatch.find()
      .select('jobSnapshot.jobTitle candidateSnapshot.candidateName matchResult.overallScore matchResult.hiringDecision createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CandidateMatch.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: matches,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

// @desc    Get single match by ID
// @route   GET /api/match/:id
// @access  Public
const getMatchById = async (req, res) => {
  const match = await CandidateMatch.findById(req.params.id);

  if (!match) {
    return res.status(404).json({ success: false, error: 'Match Analysis not found.' });
  }

  res.status(200).json({
    success: true,
    data: match,
  });
};

// @desc    Delete a match
// @route   DELETE /api/match/:id
// @access  Public
const deleteMatch = async (req, res) => {
  const match = await CandidateMatch.findByIdAndDelete(req.params.id);

  if (!match) {
    return res.status(404).json({ success: false, error: 'Match Analysis not found.' });
  }

  res.status(200).json({
    success: true,
    message: 'Match Analysis deleted successfully.',
  });
};

module.exports = { matchCandidate, getMatchHistory, getMatchById, deleteMatch };
