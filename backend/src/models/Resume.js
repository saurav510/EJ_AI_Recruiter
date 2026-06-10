const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
    field: { type: String, default: '' },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const parsedResumeSchema = new mongoose.Schema(
  {
    candidateName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    currentCompany: { type: String, default: '' },
    currentRole: { type: String, default: '' },
    skills: { type: [String], default: [] },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [String], default: [] },
    projects: { type: [projectSchema], default: [] },
    summary: { type: String, default: '' },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSize: {
      type: Number, // bytes
    },
    parsedResult: {
      type: parsedResumeSchema,
      required: true,
    },
    extractedText: {
      type: String,
      select: false, // don't include in queries by default
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
