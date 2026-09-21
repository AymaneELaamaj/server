
import express from "express";
import { register } from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { registerSchema } from "../validations/authValidation.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);

export default router;
