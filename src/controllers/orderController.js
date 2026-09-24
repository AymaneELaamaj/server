import {
  cancelUserOrder,
  createOrder,
  getValidatedOrderById,
  getValidatedOrders,
  getUserOrderById,
  getUserOrders,
} from "../services/orderService.js";
import { createInvoicePdf } from "../utils/invoicePdf.js";

export const create = async (req, res) => {
  try {
    const order = await createOrder({
      userId: req.user._id,
      items: req.body.items,
    });

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const findMine = async (req, res) => {
  try {
    const orders = await getUserOrders(req.user._id);

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const findOneMine = async (req, res) => {
  try {
    const order = await getUserOrderById(req.params.id, req.user._id);

    return res.status(200).json({
      order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const findValidated = async (req, res) => {
  try {
    const orders = await getValidatedOrders();

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const findOneValidated = async (req, res) => {
  try {
    const order = await getValidatedOrderById(req.params.id);

    return res.status(200).json({
      order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const cancelMine = async (req, res) => {
  try {
    const order = await cancelUserOrder(req.params.id, req.user._id);

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    const order = await getUserOrderById(req.params.id, req.user._id);
    const pdf = createInvoicePdf(order);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="order-${order._id}.pdf"`);

    return res.status(200).send(pdf);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};
