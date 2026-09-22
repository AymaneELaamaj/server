import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Marketplace API is running",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
export default app;
