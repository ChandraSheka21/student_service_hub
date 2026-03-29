const Student = require('../models/Student');

const getProfile = async (req, res) => {
  const student = await Student.findById(req.student._id).select('-password');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json(student);
};

const updateProfile = async (req, res) => {
  const updates = {};
  const allowed = ['name', 'department', 'email', 'mobile'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const student = await Student.findByIdAndUpdate(req.student._id, updates, { new: true }).select('-password');
  res.json(student);
};

const uploadProfileImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'File is required' });
  const path = req.file.path;
  const student = await Student.findByIdAndUpdate(req.student._id, { profileImage: path }, { new: true }).select('-password');
  res.json(student);
};

module.exports = { getProfile, updateProfile, uploadProfileImage };
