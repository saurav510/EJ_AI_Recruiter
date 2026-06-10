const mongoose = require('mongoose');

const outreachSchema = new mongoose.Schema(
  {
    // Core inputs
    candidateName: { type: String, required: true, trim: true },
    jobTitle: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },

    // Optional enrichment
    candidateSkills: { type: [String], default: [] },
    hiringDecision: { type: String, default: '' },
    currentRole: { type: String, default: '' },

    // Optional references
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateMatch', default: null },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },

    // Generated content
    whatsappMessage: { type: String, required: true },
    followUpMessage: { type: String, required: true },
    emailMessage: { type: String, required: true },

    // Track usage
    whatsappCopied: { type: Number, default: 0 },
    followUpCopied: { type: Number, default: 0 },
    emailCopied: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('OutreachMessage', outreachSchema);
