const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
  semKey:    { type: String, required: true },
  year:      { type: String, enum: ['FE','SE','TE','BE'] },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Global threshold for overall classification
  globalThreshold: {
    fastMin:    { type: Number, default: 70 },
    averageMin: { type: Number, default: 50 },
    // below averageMin = slow
  },
  // Per-subject thresholds
  subjectThresholds: [{
    subjectName: String,
    fastMin:     { type: Number, default: 70 },
    averageMin:  { type: Number, default: 50 },
  }],
  // Component weights (must add up to 100)
  weights: {
    prelim:       { type: Number, default: 15 },
    unitTest:     { type: Number, default: 10 },
    inSem:        { type: Number, default: 25 },
    endSem:       { type: Number, default: 50 },
  },
  // Combined score weights (must add up to 100)
  combinedWeights: {
    subjectAvg:    { type: Number, default: 60 },
    attendance:    { type: Number, default: 15 },
    teacherView:   { type: Number, default: 10 },
    quizAvg:       { type: Number, default: 15 },
  },
  isDefault: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

thresholdSchema.index({ semKey:1, teacherId:1 }, { unique: true });

module.exports = mongoose.model('ClassificationThreshold', thresholdSchema);