const express = require('express');
const router = express.Router();
const {
  analyzeJD,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  runPipeline
} = require('../controllers/jdController');
const validateJD = require('../middleware/validateJD');
const { multiResumeUpload } = require('../middleware/uploadMiddleware');

// POST /api/jd/analyze
router.post('/analyze', validateJD, analyzeJD);

// GET /api/jd/history?page=1&limit=10
router.get('/history', getHistory);

// GET /api/jd/:id
router.get('/:id', getAnalysisById);

// POST /api/jd/:id/pipeline — upload resumes + match + outreach with calendar link
router.post('/:id/pipeline', multiResumeUpload, runPipeline);

// DELETE /api/jd/:id
router.delete('/:id', deleteAnalysis);

module.exports = router;
