import express from 'express';
import { getAdminDashboard } from '../controllers/blogController.js';
import { getAllUsers, updateUserRole, deleteUser } from '../controllers/authController.js';
import { getAllComments } from '../controllers/commentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin middleware to all routes in this router
router.use(protect, admin);

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/comments', getAllComments);

export default router;
