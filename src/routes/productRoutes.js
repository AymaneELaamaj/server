import express from "express";
import {
  create,
  findAll,
  findOne,
  remove,
  update,
} from "../controllers/productController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createProductSchema,
  getProductsSchema,
  productIdSchema,
  updateProductSchema,
} from "../validations/productValidation.js";

const router = express.Router();

router.get("/", validateRequest(getProductsSchema), findAll);
router.get("/:id", validateRequest(productIdSchema), findOne);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createProductSchema),
  create
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateProductSchema),
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(productIdSchema),
  remove
);

export default router;
