import express from "express";
import {
  create,
  findAll,
  findOne,
  remove,
  update,
} from "../controllers/categoryController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validations/categoryValidation.js";

const router = express.Router();

router.get("/", findAll);
router.get("/:id", validateRequest(categoryIdSchema), findOne);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validateRequest(createCategorySchema),
  create
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(updateCategorySchema),
  update
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(categoryIdSchema),
  remove
);

export default router;
