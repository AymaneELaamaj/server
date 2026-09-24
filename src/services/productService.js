import { ConflictError, NotFoundError } from "../errors/index.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const DUPLICATE_PRODUCT_MESSAGE = "Product name already exists in this category";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const findProductOrFail = async (id) => {
  const product = await Product.findById(id).populate("category", "name");

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) {
    return;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new NotFoundError("Category not found");
  }
};

const getCategoryId = (category) => {
  const categoryId = category?._id || category;

  return categoryId?.toString();
};

const ensureProductNameIsAvailable = async ({ name, category, excludedId = null }) => {
  const query = {
    name,
    category,
  };

  if (excludedId) {
    query._id = { $ne: excludedId };
  }

  const existingProduct = await Product.findOne(query).collation({
    locale: "en",
    strength: 2,
  });

  if (existingProduct) {
    throw new ConflictError(DUPLICATE_PRODUCT_MESSAGE);
  }
};

const normalizeName = (name) => {
  return name.trim().toLowerCase();
};

const hasProductIdentityChanged = (product, data) => {
  const currentCategoryId = getCategoryId(product.category);
  const nextCategoryId = data.category?.toString() || currentCategoryId;
  const nextName = data.name || product.name;

  return (
    normalizeName(nextName) !== normalizeName(product.name) ||
    nextCategoryId !== currentCategoryId
  );
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
  await ensureProductNameIsAvailable({
    name: data.name,
    category: data.category,
  });

  try {
    return await Product.create(data);
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError(DUPLICATE_PRODUCT_MESSAGE);
    }

    throw error;
  }
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
  const product = await findProductOrFail(id);
  await ensureCategoryExists(data.category);

  if (hasProductIdentityChanged(product, data)) {
    await ensureProductNameIsAvailable({
      name: data.name || product.name,
      category: data.category || getCategoryId(product.category),
      excludedId: id,
    });
  }

  try {
    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name");
  } catch (error) {
    if (error.code === 11000) {
      throw new ConflictError(DUPLICATE_PRODUCT_MESSAGE);
    }

    throw error;
  }
};

export const deleteProduct = async (id) => {
  const product = await findProductOrFail(id);

  await product.deleteOne();
};
