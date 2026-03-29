const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  semester: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  description: { type: String, default: '' },
  filePath: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  ratingsCount: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

UploadSchema.index({ subject: 1, tags: 1, title: 1, department: 1, semester: 1 });

module.exports = mongoose.model('Upload', UploadSchema);
