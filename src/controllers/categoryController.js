import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/categoryService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const category = await createCategory(req.body);

  return res.status(201).json({
    message: "Category created successfully",
    category,
  });
});

export const findAll = asyncHandler(async (req, res) => {
  const categories = await getCategories();

  return res.status(200).json({
    categories,
  });
});

export const findOne = asyncHandler(async (req, res) => {
  const category = await getCategoryById(req.params.id);

  return res.status(200).json({
    category,
  });
});

export const update = asyncHandler(async (req, res) => {
  const category = await updateCategory(req.params.id, req.body);

  return res.status(200).json({
    message: "Category updated successfully",
    category,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id);

  return res.status(204).send();
});
