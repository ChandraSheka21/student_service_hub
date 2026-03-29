const express = require('express');
const { createUpload, listUploads, downloadFile, rateUpload, getStudentDashboard } = require('../controllers/uploadController');
const { authMiddleware, requireStudent } = require('../middleware/authMiddleware');
const { makeUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

const academicUpload = makeUpload({
  fieldName: 'file',
  allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg'],
  maxSize: 10 * 1024 * 1024,
});

router.post('/', authMiddleware, requireStudent, (req, res) => {
  academicUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    createUpload(req, res);
  });
});

router.get('/', authMiddleware, requireStudent, listUploads);
router.get('/download/:id', authMiddleware, requireStudent, downloadFile);
router.post('/rate/:id', authMiddleware, requireStudent, rateUpload);
router.get('/dashboard', authMiddleware, requireStudent, getStudentDashboard);

module.exports = router;
