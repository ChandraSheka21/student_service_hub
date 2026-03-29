const express = require('express');
const { getProfile, updateProfile, uploadProfileImage } = require('../controllers/profileController');
const { authMiddleware, requireStudent } = require('../middleware/authMiddleware');
const { makeUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware, requireStudent);

router.get('/', getProfile);
router.put('/', updateProfile);

// Profile image upload (jpg/png)
const profileUpload = makeUpload({ fieldName: 'profile', allowedTypes: ['image/jpeg', 'image/png'], maxSize: 2 * 1024 * 1024 });
router.post('/photo', (req, res) => {
  profileUpload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    uploadProfileImage(req, res);
  });
});

module.exports = router;
