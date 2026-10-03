import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfileImage,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadProfile } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfile.single('profileImage'), updateProfile);
router.post('/profile-image', protect, uploadProfile.single('profileImage'), uploadProfileImage);

export default router;
