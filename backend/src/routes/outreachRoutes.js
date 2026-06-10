const express = require('express');
const router = express.Router();
const {
  generateOutreach,
  getHistory,
  getOutreachById,
  trackCopy,
  deleteOutreach,
} = require('../controllers/outreachController');

// POST /api/outreach/generate
router.post('/generate', generateOutreach);

// GET /api/outreach/history?page=1&limit=10
router.get('/history', getHistory);

// GET /api/outreach/:id
router.get('/:id', getOutreachById);

// PATCH /api/outreach/:id/copy — track copy event
router.patch('/:id/copy', trackCopy);

// DELETE /api/outreach/:id
router.delete('/:id', deleteOutreach);

module.exports = router;
