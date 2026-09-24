import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../services/productService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body);

  return res.status(201).json({
    message: "Product created successfully",
    product,
  });
});

export const findAll = asyncHandler(async (req, res) => {
  const result = await getProducts(req.validated?.query || req.query);

  return res.status(200).json(result);
});

export const findOne = asyncHandler(async (req, res) => {
  const product = await getProductById(req.params.id);

  return res.status(200).json({
    product,
  });
});

export const update = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);

  return res.status(200).json({
    message: "Product updated successfully",
    product,
  });
});

export const remove = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id);

  return res.status(204).send();
});
