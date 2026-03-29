const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.uploadType || 'general';
    const base = path.join(__dirname, '..', 'uploads');
    const dest = path.join(base, type);
    ensureFolder(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const unique = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_');
    cb(null, `${unique}-${safeName}`);
  },
});

const fileFilter = (allowedMimeTypes) => {
  return (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  };
};

const makeUpload = ({ fieldName, allowedTypes, maxSize = 5 * 1024 * 1024 }) => {
  return multer({
    storage,
    limits: { fileSize: maxSize },
    fileFilter: fileFilter(allowedTypes),
  }).single(fieldName);
};

module.exports = { makeUpload };
