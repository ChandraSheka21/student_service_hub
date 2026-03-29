const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

const rollNoPattern = /^1601-24-749-00[1-9]$|^1601-24-749-0[1-4][0-9]$|^1601-24-749-050$/;

const generateToken = (user) => {
  const payload = {
    id: user._id,
    role: user.role || 'student',
    rollNo: user.rollNo,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const studentLogin = async (req, res) => {
  const { rollNo, password } = req.body;
  if (!rollNo || !password) {
    return res.status(400).json({ message: 'Roll number and password are required' });
  }

  if (!rollNoPattern.test(rollNo.trim())) {
    return res.status(400).json({ message: 'Roll number format invalid' });
  }

  let student = await Student.findOne({ rollNo: rollNo.trim() });

  const isNew = !student;
  if (!student) {
    const hashed = await bcrypt.hash(rollNo.trim(), 10);
    student = await Student.create({ rollNo: rollNo.trim(), password: hashed, firstLogin: true });
  }

  const match = await bcrypt.compare(password, student.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // First login requires password change
  if (student.firstLogin) {
    return res.json({ message: 'first_login', firstLogin: true, rollNo: student.rollNo });
  }

  const token = generateToken(student);
  res.json({ token, student: { rollNo: student.rollNo, name: student.name, department: student.department, email: student.email, mobile: student.mobile } });
};

const studentChangePassword = async (req, res) => {
  const { rollNo, currentPassword, newPassword } = req.body;
  if (!rollNo || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'rollNo, currentPassword and newPassword are required' });
  }

  const student = await Student.findOne({ rollNo: rollNo.trim() });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const match = await bcrypt.compare(currentPassword, student.password);
  if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  student.password = hashed;
  student.firstLogin = false;
  await student.save();

  const token = generateToken(student);
  res.json({ message: 'Password updated', token });
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  const admin = await Admin.findOne({ username: username.trim() });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: admin._id, role: 'admin', username: admin.username }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  res.json({ token, admin: { username: admin.username } });
};

module.exports = { studentLogin, studentChangePassword, adminLogin };
