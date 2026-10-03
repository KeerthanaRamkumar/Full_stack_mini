import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mern_blog_platform_super_secret_jwt_key_2026';

/**
 * Authentication Middleware: Protects routes by validating JWT tokens.
 * Verifies Bearer token, extracts user ID, loads user record, and attaches to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please login first.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is invalid or expired. Please login again.',
    });
  }
};

/**
 * Role-Based Authorization Middleware: Restricts route to Administrators.
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin role required.',
    });
  }
};

/**
 * Optional Authentication Middleware:
 * If an Authorization header is supplied, populates req.user; otherwise leaves it null.
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await dbStore.findUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional routes
    }
  }
  next();
};
