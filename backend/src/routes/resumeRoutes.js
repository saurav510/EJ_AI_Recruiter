const express = require('express');
const router = express.Router();
const {
  parseResume,
  getResumeHistory,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');
const { resumeUpload } = require('../middleware/uploadMiddleware');

// POST /api/resume/parse  — upload + parse
router.post('/parse', resumeUpload, parseResume);

// GET /api/resume/history?page=1&limit=10
router.get('/history', getResumeHistory);

// GET /api/resume/:id
router.get('/:id', getResumeById);

// DELETE /api/resume/:id
router.delete('/:id', deleteResume);

module.exports = router;
