import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/categoryService.js";

export const create = async (req, res) => {
  try {
    const category = await createCategory(req.body);

    return res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const findAll = async (req, res) => {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      categories,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const findOne = async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id);

    return res.status(200).json({
      category,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const update = async (req, res) => {
  try {
    const category = await updateCategory(req.params.id, req.body);

    return res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const remove = async (req, res) => {
  try {
    await deleteCategory(req.params.id);

    return res.status(204).send();
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
