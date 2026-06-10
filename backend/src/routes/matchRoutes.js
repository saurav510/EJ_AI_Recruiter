const express = require('express');
const router = express.Router();
const {
  matchCandidate,
  getMatchHistory,
  getMatchById,
  deleteMatch,
} = require('../controllers/matchController');

// POST /api/match/candidate
router.post('/candidate', matchCandidate);

// GET /api/match/history?page=1&limit=10
router.get('/history', getMatchHistory);

// GET /api/match/:id
router.get('/:id', getMatchById);

// DELETE /api/match/:id
router.delete('/:id', deleteMatch);

module.exports = router;
