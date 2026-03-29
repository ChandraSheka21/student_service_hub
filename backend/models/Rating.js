const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

RatingSchema.index({ uploadId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
