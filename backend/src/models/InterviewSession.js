const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    evaluationCriteria: { type: [String], default: [] },
    followUpQuestions: { type: [String], default: [] },
    expectedAnswer: { type: String, default: '' },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    // Optional references to stored analyses
    jdId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobAnalysis', default: null },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateMatch', default: null },

    // Context snapshots
    jobTitle: { type: String, default: '' },
    candidateName: { type: String, default: '' },
    seniorityLevel: { type: String, default: '' },

    // Generated questions
    technicalQuestions: { type: [questionSchema], default: [] },
    behavioralQuestions: { type: [questionSchema], default: [] },
    scenarioQuestions: { type: [questionSchema], default: [] },
    skillGapQuestions: { type: [questionSchema], default: [] },

    // Meta
    totalQuestions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save: compute total
interviewSessionSchema.pre('save', function () {
  this.totalQuestions =
    this.technicalQuestions.length +
    this.behavioralQuestions.length +
    this.scenarioQuestions.length +
    this.skillGapQuestions.length;
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
