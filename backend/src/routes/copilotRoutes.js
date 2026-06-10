const express = require('express');
const router = express.Router();
const { startSession, sendMessage, getHistory, getSession, deleteSession } = require('../controllers/copilotController');

router.post('/start', startSession);
router.post('/:id/message', sendMessage);
router.get('/history', getHistory);
router.get('/:id', getSession);
router.delete('/:id', deleteSession);

module.exports = router;
