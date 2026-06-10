const mongoose = require('mongoose');

const parsedResultSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, default: '' },
    experienceRequired: { type: String, default: '' },
    location: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    mandatorySkills: { type: [String], default: [] },
    goodToHaveSkills: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    education: { type: [String], default: [] },
    industry: { type: String, default: '' },
    seniorityLevel: { type: String, default: '' },
  },
  { _id: false }
);

const jobAnalysisSchema = new mongoose.Schema(
  {
    originalJD: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    parsedResult: {
      type: parsedResultSchema,
      required: true,
    },
    wordCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save: compute word count
jobAnalysisSchema.pre('save', function () {
  this.wordCount = this.originalJD.trim().split(/\s+/).length;
});

module.exports = mongoose.model('JobAnalysis', jobAnalysisSchema);
