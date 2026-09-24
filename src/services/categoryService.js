import { ConflictError, NotFoundError } from "../errors/index.js";
import Category from "../models/Category.js";

const findCategoryOrFail = async (id) => {
  const category = await Category.findById(id);

  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};

const ensureCategoryNameIsAvailable = async (name, excludedId = null) => {
  if (!name) {
    return;
  }

  const query = { name };

  if (excludedId) {
    query._id = { $ne: excludedId };
  }

  const existingCategory = await Category.findOne(query);

  if (existingCategory) {
    throw new ConflictError("Category name already exists");
  }
};

export const createCategory = async (data) => {
  await ensureCategoryNameIsAvailable(data.name);

  try {
    return await Category.create(data);
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError("Category name already exists");
    }

    throw error;
  }
};

export const getCategories = async () => {
  return Category.find().sort({ createdAt: -1 });
};

export const getCategoryById = async (id) => {
  return findCategoryOrFail(id);
};

export const updateCategory = async (id, data) => {
  await findCategoryOrFail(id);
  await ensureCategoryNameIsAvailable(data.name, id);

  try {
    return await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError("Category name already exists");
    }

    throw error;
  }
};

export const deleteCategory = async (id) => {
  const category = await findCategoryOrFail(id);

  await category.deleteOne();
};
