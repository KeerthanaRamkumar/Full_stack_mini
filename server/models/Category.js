import mongoose from 'mongoose';

/**
 * Category Schema
 * Represents editorial topics such as Technology, Programming, Lifestyle, etc.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Category name cannot exceed 40 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;
