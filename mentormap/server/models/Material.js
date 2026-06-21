const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  subject:     { type: String, default: '' },
  fileUrl:     { type: String, default: '' },
  fileType:    { type: String, enum: ['pdf','video','document','link'], default: 'pdf' },
  targetGroup: { type: String, default: 'all' },
  year:        { type: String, enum: ['FE','SE','TE','BE','all'], default: 'all' },
  description: { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', materialSchema);