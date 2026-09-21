import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/User.js";

dotenv.config();

const SALT_ROUNDS = 12;

const requiredEnvVars = [
  "MONGO_URI",
  "ADMIN_NAME",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }
};

const seedAdmin = async () => {
  try {
    validateEnv();

    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingUser) {
      if (existingUser.role === "ADMIN") {
        console.log("Admin already exists");
        return;
      }

      throw new Error("A non-admin user already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      SALT_ROUNDS
    );

    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
