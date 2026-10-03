import { dbStore } from '../services/dbStore.js';

/**
 * @desc    Get all published blogs with search and filtering
 * @route   GET /api/blogs
 * @access  Public
 */
export const getBlogs = async (req, res) => {
  try {
    const { search = '', category = '', tag = '', page = 1, limit = 20, status = 'published' } = req.query;

    // By default, public endpoint only returns published articles
    const result = await dbStore.getBlogs({
      search,
      category,
      tag,
      status: req.query.includeDrafts === 'true' && req.user ? 'all' : status,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.json({
      success: true,
      blogs: result.blogs,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blogs.',
    });
  }
};

/**
 * @desc    Get single blog by ID
 * @route   GET /api/blogs/:id
 * @access  Public (Optional auth for like/bookmark state)
 */
export const getBlogById = async (req, res) => {
  try {
    const blog = await dbStore.getBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // If draft, only author or admin can view
    if (blog.status === 'draft') {
      const isAuthor = req.user && req.user._id.toString() === (blog.author._id || blog.author).toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This article is currently an unpublished draft.',
        });
      }
    }

    // Check if the current user has liked or bookmarked this blog
    let isLiked = false;
    let isBookmarked = false;

    if (req.user) {
      const userIdStr = req.user._id.toString();
      isLiked = Array.isArray(blog.likes) && blog.likes.some((id) => id.toString() === userIdStr);
      isBookmarked = await dbStore.isBlogBookmarked(req.user._id, blog._id);
    }

    return res.json({
      success: true,
      blog: {
        ...blog,
        likesCount: Array.isArray(blog.likes) ? blog.likes.length : 0,
        isLiked,
        isBookmarked,
      },
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve blog details.',
    });
  }
};

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private (Logged-in user)
 */
export const createBlog = async (req, res) => {
  try {
    const { title, content, category, categoryName, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
    }

    // Cover image path: from multer file or fallback URL
    let coverImagePath = '';
    if (req.file) {
      coverImagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.coverImage) {
      coverImagePath = req.body.coverImage;
    }

    // Parse tags if string
    let parsedTags = [];
    if (typeof tags === 'string') {
      parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }

    const newBlog = await dbStore.createBlog({
      title,
      content,
      author: req.user._id,
      category: category || null,
      categoryName: categoryName || 'General',
      tags: parsedTags,
      coverImage: coverImagePath,
      status: status === 'draft' ? 'draft' : 'published',
    });

    return res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Draft saved successfully.' : 'Article published successfully.',
      blog: newBlog,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create blog post.',
    });
  }
};

/**
 * @desc    Update existing blog post
 * @route   PUT /api/blogs/:id
 * @access  Private (Author or Admin)
 */
export const updateBlog = async (req, res) => {
  try {
    const blog = await dbStore.getBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Verify ownership or admin role
    const blogAuthorId = (blog.author._id || blog.author).toString();
    const isOwner = req.user._id.toString() === blogAuthorId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this article.',
      });
    }

    const { title, content, category, categoryName, tags, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category !== undefined) updateData.category = category;
    if (categoryName !== undefined) updateData.categoryName = categoryName;
    if (status !== undefined) updateData.status = status;

    if (tags !== undefined) {
      if (typeof tags === 'string') {
        updateData.tags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray(tags)) {
        updateData.tags = tags;
      }
    }

    // Handle new uploaded image
    if (req.file) {
      updateData.coverImage = `/uploads/${req.file.filename}`;
    } else if (req.body.coverImage !== undefined) {
      updateData.coverImage = req.body.coverImage;
    }

    const updatedBlog = await dbStore.updateBlog(req.params.id, updateData);

    return res.json({
      success: true,
      message: 'Article updated successfully.',
      blog: updatedBlog,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update blog.',
    });
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private (Author or Admin)
 */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await dbStore.getBlogById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const blogAuthorId = (blog.author._id || blog.author).toString();
    const isOwner = req.user._id.toString() === blogAuthorId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this article.',
      });
    }

    await dbStore.deleteBlog(req.params.id);

    return res.json({
      success: true,
      message: 'Article deleted successfully.',
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blog.',
    });
  }
};

/**
 * @desc    Like or unlike a blog post
 * @route   POST /api/blogs/:id/like
 * @access  Private
 */
export const toggleLike = async (req, res) => {
  try {
    const result = await dbStore.toggleLikeBlog(req.params.id, req.user._id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    return res.json({
      success: true,
      liked: result.liked,
      likesCount: result.likesCount,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update like status.',
    });
  }
};

/**
 * @desc    Bookmark or unbookmark a blog post
 * @route   POST /api/blogs/:id/bookmark
 * @access  Private
 */
export const toggleBookmark = async (req, res) => {
  try {
    const blog = await dbStore.getBlogById(req.params.id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    const result = await dbStore.toggleBookmark(req.user._id, req.params.id);

    return res.json({
      success: true,
      bookmarked: result.bookmarked,
      message: result.bookmarked ? 'Article added to your bookmarks.' : 'Article removed from your bookmarks.',
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update bookmark status.',
    });
  }
};

/**
 * @desc    Get all bookmarks for current user
 * @route   GET /api/blogs/user/bookmarks
 * @access  Private
 */
export const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await dbStore.getUserBookmarks(req.user._id);
    return res.json({
      success: true,
      bookmarks,
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookmarks.',
    });
  }
};

/**
 * @desc    Get author dashboard data (author stats + their blogs)
 * @route   GET /api/blogs/user/dashboard
 * @access  Private
 */
export const getAuthorDashboard = async (req, res) => {
  try {
    const stats = await dbStore.getDashboardStats(req.user._id);
    const blogsResult = await dbStore.getBlogs({
      authorId: req.user._id,
      status: 'all',
      limit: 100,
    });

    return res.json({
      success: true,
      stats,
      blogs: blogsResult.blogs,
    });
  } catch (error) {
    console.error('Author dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data.',
    });
  }
};

/**
 * @desc    Get admin dashboard stats & overview
 * @route   GET /api/admin/dashboard
 * @access  Private / Admin
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const stats = await dbStore.getDashboardStats(null);
    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load admin statistics.',
    });
  }
};
