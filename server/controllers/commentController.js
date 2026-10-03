import { dbStore } from '../services/dbStore.js';

/**
 * @desc    Get comments for a specific blog
 * @route   GET /api/blogs/:id/comments
 * @access  Public
 */
export const getCommentsByBlog = async (req, res) => {
  try {
    const comments = await dbStore.getCommentsByBlog(req.params.id);
    return res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments.',
    });
  }
};

/**
 * @desc    Add a comment to a blog
 * @route   POST /api/blogs/:id/comments
 * @access  Private (Logged-in user)
 */
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    const blog = await dbStore.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const comment = await dbStore.createComment({
      blogId: req.params.id,
      userId: req.user._id,
      text,
    });

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment,
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to post comment.',
    });
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Comment author or Admin)
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await dbStore.findCommentById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const commentUserId = (comment.user._id || comment.user).toString();
    const isOwner = req.user._id.toString() === commentUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    await dbStore.deleteComment(req.params.id);

    return res.json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment.',
    });
  }
};

/**
 * @desc    Get all comments across all blogs (Admin only)
 * @route   GET /api/admin/comments
 * @access  Private / Admin
 */
export const getAllComments = async (req, res) => {
  try {
    const comments = await dbStore.getAllComments();
    return res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Admin get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load comments list.',
    });
  }
};
