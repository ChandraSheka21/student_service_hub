const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, trim: true },
  name: { type: String, default: '' },
  password: { type: String, required: true },
  department: { type: String, default: '' },
  email: { type: String, default: '' },
  mobile: { type: String, default: '' },
  uploadCount: { type: Number, default: 0 },
  firstLogin: { type: Boolean, default: true },
  profileImage: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Student', StudentSchema);
