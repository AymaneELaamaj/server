import express from "express";
import {
  cancelMine,
  create,
  downloadInvoice,
  findMine,
  findOneValidated,
  findOneMine,
  findValidated,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createOrderSchema, orderIdSchema } from "../validations/orderValidation.js";

const router = express.Router();

router.get("/admin/validated", authenticate, authorize("ADMIN"), findValidated);
router.get(
  "/admin/validated/:id",
  authenticate,
  authorize("ADMIN"),
  validateRequest(orderIdSchema),
  findOneValidated
);

router.use(authenticate, authorize("CLIENT"));

router.post("/", validateRequest(createOrderSchema), create);
router.get("/my-orders", findMine);
router.get("/:id/invoice", validateRequest(orderIdSchema), downloadInvoice);
router.get("/:id", validateRequest(orderIdSchema), findOneMine);
router.patch("/:id/cancel", validateRequest(orderIdSchema), cancelMine);

export default router;
