const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const progressSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  completed:  { type: Boolean, default: false },
  completedAt:{ type: Date }
});

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['student','teacher','admin'], default: 'student' },
  status:   { type: String, enum: ['pending','approved','rejected'], default: 'approved' },
  isMainAdmin: { type: Boolean, default: false },

  // Year — FE / SE / TE / BE
  year: { type: String, enum: ['FE','SE','TE','BE',null], default: null },

  // Teacher type
  teacherType: { type: String, enum: ['class_teacher','subject_teacher', null], default: null },

  // For teachers — which subjects they teach
  subjects: [{ type: String }],

  // For teachers — assigned years
  assignedYears: [{ type: String, enum: ['FE','SE','TE','BE'] }],

  // Learner classification
  group: { type: String, enum: ['slow','average','fast','unclassified'], default: 'unclassified' },

  progress: [progressSchema],
  quizHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' }],

  mlFeatures: {
    avg_score:             { type: Number, default: 0 },
    avg_time_per_question: { type: Number, default: 0 },
    quiz_count:            { type: Number, default: 0 },
    latest_score:          { type: Number, default: 0 },
    attendance:            { type: Number, default: 0 },
    previous_grade:        { type: Number, default: 0 },
    assignment_completion: { type: Number, default: 0 },
    study_hours:           { type: Number, default: 0 },
    class_participation:   { type: Number, default: 0 },
    homework_submission:   { type: Number, default: 0 },
    attention_span:        { type: Number, default: 0 },
    peer_interaction:      { type: Number, default: 0 },
    behaviour_score:       { type: Number, default: 0 }
  },

  academicDataUploaded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (p) {
  return bcrypt.compare(p, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);