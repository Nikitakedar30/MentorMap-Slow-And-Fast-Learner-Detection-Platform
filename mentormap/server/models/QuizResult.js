const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex:  { type: Number },
  questionText:   { type: String, default: '' },
  options:        [{ type: String }],
  selectedOption: { type: Number },
  correctOption:  { type: Number },
  correct:        { type: Boolean },
  timeTaken:      { type: Number, default: 0 }
});

const quizResultSchema = new mongoose.Schema({
  studentId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  answers:            [answerSchema],
  totalTime:          { type: Number, default: 0 },
  score:              { type: Number, default: 0 },
  avgTimePerQuestion: { type: Number, default: 0 },
  totalQuestions:     { type: Number, default: 0 },
  correctAnswers:     { type: Number, default: 0 },
  createdAt:          { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);