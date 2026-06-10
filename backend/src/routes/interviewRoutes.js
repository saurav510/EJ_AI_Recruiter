const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  getHistory,
  getSessionById,
  deleteSession,
} = require('../controllers/interviewController');

// POST /api/interview/questions
router.post('/questions', generateQuestions);

// GET /api/interview/history?page=1&limit=10
router.get('/history', getHistory);

// GET /api/interview/:id
router.get('/:id', getSessionById);

// DELETE /api/interview/:id
router.delete('/:id', deleteSession);

module.exports = router;
