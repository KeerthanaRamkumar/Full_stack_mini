import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  toggleBookmark,
  getMyBookmarks,
  getAuthorDashboard,
} from '../controllers/blogController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { getCommentsByBlog, createComment } from '../controllers/commentController.js';

const router = express.Router();

// Specific user subroutes MUST come before /:id parameterized routes
router.get('/user/bookmarks', protect, getMyBookmarks);
router.get('/user/dashboard', protect, getAuthorDashboard);

// Main blog CRUD
router.get('/', optionalAuth, getBlogs);
router.get('/:id', optionalAuth, getBlogById);
router.post('/', protect, upload.single('coverImage'), createBlog);
router.put('/:id', protect, upload.single('coverImage'), updateBlog);
router.delete('/:id', protect, deleteBlog);

// Likes & Bookmarks
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

// Blog nested comments
router.get('/:id/comments', getCommentsByBlog);
router.post('/:id/comments', protect, createComment);

export default router;
