import { registerUser, loginUser } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  return res.status(201).json({
    message: "User created successfully",
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.body);

  return res.status(200).json({
    message: "Login successful",
    ...user,
  });
});
