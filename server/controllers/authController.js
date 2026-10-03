import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mern_blog_platform_super_secret_jwt_key_2026';

// Helper to generate signed JWT token (expires in 7 days)
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check duplicate email
    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user record
    const user = await dbStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        profileImageFilename: user.profileImageFilename,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        profileImageFilename: user.profileImageFilename,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

/**
 * @desc    Get current authenticated user info + stats
 * @route   GET /api/auth/me
 * @access  Private (Bearer token)
 */
export const getMe = async (req, res) => {
  try {
    const user = await dbStore.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    // Fetch user stats
    const stats = await dbStore.getDashboardStats(user._id);

    return res.json({
      success: true,
      user: {
        ...user,
        stats,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile data.',
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;

    // If an image file was uploaded via Multer
    if (req.file) {
      updateData.profileImage = `/uploads/profileImages/${req.file.filename}`;
      updateData.profileImageFilename = req.file.filename;
    } else if (req.body.profileImage !== undefined) {
      updateData.profileImage = req.body.profileImage;
    }

    const updatedUser = await dbStore.updateUser(req.user._id, updateData);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};

/**
 * @desc    Upload profile image via Multer to server/uploads/profileImages/
 * @route   POST /api/auth/profile-image
 * @access  Private
 */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please choose an image file to upload.',
      });
    }

    const filename = req.file.filename;
    const imageUrl = `/uploads/profileImages/${filename}`;

    const updatedUser = await dbStore.updateUser(req.user._id, {
      profileImage: imageUrl,
      profileImageFilename: filename,
    });

    return res.json({
      success: true,
      message: 'Profile image updated successfully.',
      imageUrl,
      filename,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image.',
    });
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/admin/users
 * @access  Private / Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await dbStore.getAllUsers();
    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users list.',
    });
  }
};

/**
 * @desc    Update user role (Admin only)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private / Admin
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either "user" or "admin".',
      });
    }

    const updated = await dbStore.updateUser(req.params.id, { role });
    return res.json({
      success: true,
      message: 'User role updated successfully.',
      user: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
    });
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private / Admin
 */
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own account.',
      });
    }

    await dbStore.deleteUser(req.params.id);
    return res.json({
      success: true,
      message: 'User account and associated content deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user account.',
    });
  }
};
