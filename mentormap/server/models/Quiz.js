const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
  timeLimit: { type: Number, default: 30 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  quizType: {
    type: String,
    enum: ['paragraph', 'video', 'pdf'],
    default: 'paragraph'
  },
  paragraph: { type: String, default: '' },
  paragraphDisplayTime: { type: Number, default: 20 },
  pdfTitle: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  videoDisplayTime: { type: Number, default: 60 },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);