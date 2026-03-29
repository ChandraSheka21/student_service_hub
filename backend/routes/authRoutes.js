const express = require('express');
const { body } = require('express-validator');
const { studentLogin, studentChangePassword, adminLogin } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/student/login',
  [body('rollNo').notEmpty().withMessage('Roll number required'), body('password').notEmpty().withMessage('Password required')],
  studentLogin
);

router.post(
  '/student/change-password',
  [
    body('rollNo').notEmpty(),
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  studentChangePassword
);

router.post(
  '/admin/login',
  [body('username').notEmpty(), body('password').notEmpty()],
  adminLogin
);

module.exports = router;
