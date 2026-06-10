const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const copilotSessionSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateMatch', required: true },
    candidateName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    messages: { type: [messageSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CopilotSession', copilotSessionSchema);
