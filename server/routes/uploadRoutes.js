import express from 'express';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file uploaded.',
    });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    message: 'Image uploaded successfully.',
    imageUrl,
    filename: req.file.filename,
  });
});

export default router;
