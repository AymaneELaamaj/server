import bcrypt from "bcrypt";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
const SALT_ROUNDS = 10;

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("Email already exists");
    error.statusCode = 409;
    throw error;
  }
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }
  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};