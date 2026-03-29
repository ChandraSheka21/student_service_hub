const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment');
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Determine whether token is for student or admin
    if (payload.role === 'admin') {
      const admin = await Admin.findById(payload.id);
      if (!admin) return res.status(401).json({ message: 'Invalid token' });
      req.admin = admin;
    } else {
      const student = await Student.findById(payload.id);
      if (!student) return res.status(401).json({ message: 'Invalid token' });
      req.student = student;
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireStudent = (req, res, next) => {
  if (!req.student) {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, requireStudent, requireAdmin };
