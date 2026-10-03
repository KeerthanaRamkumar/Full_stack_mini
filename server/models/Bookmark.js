import mongoose from 'mongoose';

/**
 * Bookmark Schema
 * Stores reading-list references linking users to saved blogs.
 */
const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bookmark must belong to a user'],
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Bookmark must point to a blog'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks for the same user and blog
bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
