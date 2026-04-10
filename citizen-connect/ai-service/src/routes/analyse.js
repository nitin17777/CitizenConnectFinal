const express = require('express');
const multer = require('multer');
const { analyseComplaint } = require('../services/analyserService');

const router = express.Router();

// Store file in memory so we can pass buffer directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

/**
 * POST /analyse
 * Body (multipart/form-data):
 *   image        - image file
 *   complaintText - string
 *   category     - string
 *   location     - string
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { complaintText = '', category = 'other', location = '' } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const result = await analyseComplaint({ imageBuffer, complaintText, category, location });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
