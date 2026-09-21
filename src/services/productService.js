import Category from "../models/Category.js";
import Product from "../models/Product.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const findProductOrFail = async (id) => {
  const product = await Product.findById(id).populate("category", "name");

  if (!product) {
    throw createError("Product not found", 404);
  }

  return product;
};

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) {
    return;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw createError("Category not found", 404);
  }
};

const buildProductQuery = ({ search, category, minPrice, maxPrice }) => {
  const query = {};

  if (search) {
    query.name = { $regex: escapeRegex(search), $options: "i" };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};

    if (minPrice !== undefined) {
      query.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      query.price.$lte = maxPrice;
    }
  }

  return query;
};

const buildSortOption = (sort) => {
  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    createdAt_asc: { createdAt: 1 },
    createdAt_desc: { createdAt: -1 },
  };

  return sortOptions[sort] || sortOptions.createdAt_desc;
};

export const createProduct = async (data) => {
  await ensureCategoryExists(data.category);

  return Product.create(data);
};

export const getProducts = async (filters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;
  const query = buildProductQuery(filters);
  const sortOption = buildSortOption(filters.sort);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id) => {
  return findProductOrFail(id);
};

export const updateProduct = async (id, data) => {
  await findProductOrFail(id);
  await ensureCategoryExists(data.category);

  return Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("category", "name");
};

export const deleteProduct = async (id) => {
  const product = await findProductOrFail(id);

  await product.deleteOne();
};
