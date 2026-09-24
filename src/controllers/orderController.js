import {
  cancelUserOrder,
  createOrder,
  getValidatedOrderById,
  getValidatedOrders,
  getUserOrderById,
  getUserOrders,
} from "../services/orderService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createInvoicePdf } from "../utils/invoicePdf.js";

export const create = asyncHandler(async (req, res) => {
  const order = await createOrder({
    userId: req.user._id,
    items: req.body.items,
  });

  return res.status(201).json({
    message: "Order created successfully",
    order,
  });
});

export const findMine = asyncHandler(async (req, res) => {
  const orders = await getUserOrders(req.user._id);

  return res.status(200).json({
    orders,
  });
});

export const findOneMine = asyncHandler(async (req, res) => {
  const order = await getUserOrderById(req.params.id, req.user._id);

  return res.status(200).json({
    order,
  });
});

export const findValidated = asyncHandler(async (req, res) => {
  const orders = await getValidatedOrders();

  return res.status(200).json({
    orders,
  });
});

export const findOneValidated = asyncHandler(async (req, res) => {
  const order = await getValidatedOrderById(req.params.id);

  return res.status(200).json({
    order,
  });
});

export const cancelMine = asyncHandler(async (req, res) => {
  const order = await cancelUserOrder(req.params.id, req.user._id);

  return res.status(200).json({
    message: "Order cancelled successfully",
    order,
  });
});

export const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await getUserOrderById(req.params.id, req.user._id);
  const pdf = createInvoicePdf(order);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="order-${order._id}.pdf"`);

  return res.status(200).send(pdf);
});
