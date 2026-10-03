import { dbStore } from '../services/dbStore.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await dbStore.getAllCategories();
    return res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
    });
  }
};

/**
 * @desc    Create new category
 * @route   POST /api/categories
 * @access  Private / Admin
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required.',
      });
    }

    const category = await dbStore.createCategory({ name, description });
    return res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create category.',
    });
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private / Admin
 */
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await dbStore.updateCategory(req.params.id, { name, description });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Category updated successfully.',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category.',
    });
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private / Admin
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await dbStore.findCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    await dbStore.deleteCategory(req.params.id);
    return res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category.',
    });
  }
};
