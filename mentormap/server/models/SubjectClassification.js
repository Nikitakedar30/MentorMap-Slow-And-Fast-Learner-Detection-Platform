const mongoose = require('mongoose');

const subjectScoreSchema = new mongoose.Schema({
  subjectName:  { type: String },
  prelim:       { type: Number, default: 0 },
  unitTest:     { type: Number, default: 0 },
  inSem:        { type: Number, default: 0 },
  endSem:       { type: Number, default: 0 },
  totalMarks:   { type: Number, default: 0 },
  percentage:   { type: Number, default: 0 },
  grade:        { type: String, default: '' },
  subjectGroup: { type: String, enum: ['slow','average','fast','unclassified'], default: 'unclassified' },
});

const classificationSchema = new mongoose.Schema({
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName:  { type: String },
  studentEmail: { type: String },
  rollNo:       { type: String },
  year:         { type: String, enum: ['FE','SE','TE','BE'] },
  semester:     { type: Number },
  semKey:       { type: String },

  // Per-subject scores
  subjectScores: [subjectScoreSchema],

  // Common scores
  attendance:            { type: Number, default: 0 },
  teachersViewScore:     { type: Number, default: 0 },
  recentParagraphQuiz:   { type: Number, default: 0 },
  recentVideoQuiz:       { type: Number, default: 0 },

  // Overall computed
  overallPercentage:     { type: Number, default: 0 },
  overallGroup:          { type: String, enum: ['slow','average','fast','unclassified'], default: 'unclassified' },

  // Subject-wise group summary
  subjectWiseSummary: [{
    subject:  { type: String },
    group:    { type: String },
    percentage: { type: Number },
  }],

  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('SubjectClassification', classificationSchema);