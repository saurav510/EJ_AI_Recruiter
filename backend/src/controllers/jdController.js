const JobAnalysis = require('../models/JobAnalysis');
const Resume = require('../models/Resume');
const CandidateMatch = require('../models/CandidateMatch');
const OutreachMessage = require('../models/OutreachMessage');

const { analyzeWithGemini } = require('../services/geminiService');
const { extractText, parseResumeWithGemini } = require('../services/resumeService');
const { matchCandidateWithGemini } = require('../services/matchService');
const { generateOutreachMessages } = require('../services/outreachService');

// @desc    Analyze a job description
// @route   POST /api/jd/analyze
// @access  Public
const analyzeJD = async (req, res) => {
  const { jobDescription } = req.body;

  // Call Gemini
  const parsedResult = await analyzeWithGemini(jobDescription);

  // Persist to MongoDB
  const analysis = new JobAnalysis({
    originalJD: jobDescription,
    parsedResult,
  });
  await analysis.save();

  res.status(201).json({
    success: true,
    data: {
      id: analysis._id,
      parsedResult: analysis.parsedResult,
      wordCount: analysis.wordCount,
      createdAt: analysis.createdAt,
    },
  });
};

// @desc    Get all analyses (paginated)
// @route   GET /api/jd/history
// @access  Public
const getHistory = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    JobAnalysis.find()
      .select('parsedResult.jobTitle parsedResult.seniorityLevel parsedResult.location wordCount createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    JobAnalysis.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: analyses,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

// @desc    Get single analysis by ID
// @route   GET /api/jd/:id
// @access  Public
const getAnalysisById = async (req, res) => {
  const analysis = await JobAnalysis.findById(req.params.id);

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: 'Analysis not found.',
    });
  }

  res.status(200).json({
    success: true,
    data: analysis,
  });
};

// @desc    Delete an analysis
// @route   DELETE /api/jd/:id
// @access  Public
const deleteAnalysis = async (req, res) => {
  const analysis = await JobAnalysis.findByIdAndDelete(req.params.id);

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: 'Analysis not found.',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Analysis deleted successfully.',
  });
};

// @desc    Run automated recruitment pipeline on multiple resumes for a job
// @route   POST /api/jd/:id/pipeline
// @access  Public
const runPipeline = async (req, res) => {
  const { id } = req.params;
  const { calendarLink } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one resume file is required.' });
  }

  const jobAnalysis = await JobAnalysis.findById(id);
  if (!jobAnalysis) {
    return res.status(404).json({ success: false, error: 'Job Description analysis not found.' });
  }
  const jobData = jobAnalysis.parsedResult;

  const results = [];

  for (const file of files) {
    try {
      const { buffer, originalname, mimetype, size } = file;
      const ext = originalname.split('.').pop().toLowerCase();

      // Step 1: Extract text
      const extractedText = await extractText(buffer, mimetype);

      // Step 2: Parse resume details
      const parsedResumeData = await parseResumeWithGemini(extractedText);

      // Step 3: Save Resume to DB
      const resume = new Resume({
        originalFileName: originalname,
        fileType: ext,
        fileSize: size,
        parsedResult: parsedResumeData,
        extractedText,
      });
      await resume.save();

      // Step 4: Evaluate match with JD
      const matchResult = await matchCandidateWithGemini(jobData, parsedResumeData);

      const candidateMatch = new CandidateMatch({
        jobAnalysisId: id,
        parsedResumeId: resume._id,
        jobSnapshot: jobData,
        candidateSnapshot: parsedResumeData,
        matchResult,
      });
      await candidateMatch.save();

      // Step 5: Generate Outreach Messages
      const companyName = jobData.companyName || jobData.company || jobData.industry || 'the company';

      const generatedMessages = await generateOutreachMessages({
        candidateName: parsedResumeData.candidateName,
        jobTitle: jobData.jobTitle,
        companyName,
        matchScore: matchResult.overallScore,
        candidateSkills: parsedResumeData.skills,
        hiringDecision: matchResult.hiringDecision,
        currentRole: parsedResumeData.currentRole,
      });

      // Inject calendar link if provided
      if (calendarLink && calendarLink.trim()) {
        const trimmedLink = calendarLink.trim();
        generatedMessages.whatsappMessage = generatedMessages.whatsappMessage + `\n\nSchedule a time here: ${trimmedLink}`;
        generatedMessages.emailMessage = generatedMessages.emailMessage + `\n\nSchedule link: ${trimmedLink}`;
      }

      // Save outreach to DB
      const outreachDoc = new OutreachMessage({
        matchId: candidateMatch._id,
        resumeId: resume._id,
        candidateName: parsedResumeData.candidateName,
        jobTitle: jobData.jobTitle,
        companyName,   // resolved above — never empty
        matchScore: matchResult.overallScore,
        whatsappMessage: generatedMessages.whatsappMessage,
        followUpMessage: generatedMessages.followUpMessage,
        emailMessage: generatedMessages.emailMessage,
      });
      await outreachDoc.save();

      const isMatched = matchResult.overallScore >= 70 && matchResult.hiringDecision !== 'No Hire';

      results.push({
        success: true,
        fileName: originalname,
        candidateName: parsedResumeData.candidateName,
        phone: parsedResumeData.phone,
        email: parsedResumeData.email,
        matchScore: matchResult.overallScore,
        hiringDecision: matchResult.hiringDecision,
        strengths: matchResult.strengths,
        skillGaps: matchResult.skillGaps,
        risks: matchResult.risks,
        recommendation: matchResult.recommendation,
        isMatched,
        whatsappMessage: generatedMessages.whatsappMessage,
        emailMessage: generatedMessages.emailMessage,
        outreachId: outreachDoc._id,
        matchId: candidateMatch._id,
        resumeId: resume._id
      });

    } catch (err) {
      console.error(`Error processing file ${file.originalname}:`, err);
      results.push({
        success: false,
        fileName: file.originalname,
        error: err.message || 'Failed to process resume.'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: results
  });
};

module.exports = {
  analyzeJD,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  runPipeline
};
