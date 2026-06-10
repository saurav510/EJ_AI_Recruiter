const mongoose = require('mongoose');

const matchScoresSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, min: 0, max: 100, default: 0 },
    skillMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    experienceMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    educationMatchScore: { type: Number, min: 0, max: 100, default: 0 },
    strengths: { type: [String], default: [] },
    skillGaps: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    recommendation: { type: String, default: '' },
    hiringDecision: {
      type: String,
      enum: ['Strong Hire', 'Hire', 'Maybe', 'No Hire', ''],
      default: '',
    },
  },
  { _id: false }
);

const candidateMatchSchema = new mongoose.Schema(
  {
    // References (when matched from stored analyses)
    jdId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobAnalysis', default: null },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },

    // Denormalized snapshots so result is self-contained
    jobSnapshot: {
      jobTitle: { type: String, default: '' },
      seniorityLevel: { type: String, default: '' },
      industry: { type: String, default: '' },
      mandatorySkills: { type: [String], default: [] },
      experienceRequired: { type: String, default: '' },
    },
    candidateSnapshot: {
      candidateName: { type: String, default: '' },
      currentRole: { type: String, default: '' },
      experienceYears: { type: Number, default: 0 },
      skills: { type: [String], default: [] },
    },

    // Gemini match result
    matchResult: { type: matchScoresSchema, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('CandidateMatch', candidateMatchSchema);
