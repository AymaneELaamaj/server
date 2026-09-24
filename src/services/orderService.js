import { BadRequestError, NotFoundError } from "../errors/index.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const findUserOrderOrFail = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate("user", "name email")
    .populate("items.product", "name imageUrl");

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
};

const normalizeCartItems = (items) => {
  const quantityByProduct = new Map();

  items.forEach((item) => {
    const productId = item.product.toString();
    const currentQuantity = quantityByProduct.get(productId) || 0;

    quantityByProduct.set(productId, currentQuantity + item.quantity);
  });

  return Array.from(quantityByProduct, ([product, quantity]) => ({
    product,
    quantity,
  }));
};

export const createOrder = async ({ userId, items }) => {
  const normalizedItems = normalizeCartItems(items);
  const productIds = normalizedItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== productIds.length) {
    throw new NotFoundError("One or more products were not found");
  }

  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  const orderItems = normalizedItems.map((item) => {
    const product = productsById.get(item.product);

    if (product.stock < item.quantity) {
      throw new BadRequestError(`${product.name} does not have enough stock`);
    }

    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  await Product.bulkWrite(
    orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.quantity } },
      },
    }))
  );

  return Order.create({
    user: userId,
    items: orderItems,
    total,
  });
};

export const getUserOrders = async (userId) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

export const getUserOrderById = async (orderId, userId) => {
  return findUserOrderOrFail(orderId, userId);
};

export const getValidatedOrders = async () => {
  return Order.find({ status: "VALIDATED" })
    .populate("user", "name email")
    .sort({ createdAt: -1 });
};

export const getValidatedOrderById = async (orderId) => {
  const order = await Order.findOne({ _id: orderId, status: "VALIDATED" })
    .populate("user", "name email")
    .populate("items.product", "name imageUrl");

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
};

export const cancelUserOrder = async (orderId, userId) => {
  const order = await findUserOrderOrFail(orderId, userId);

  if (order.status === "CANCELLED") {
    throw new BadRequestError("Order is already cancelled");
  }

  await Product.bulkWrite(
    order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.product._id || item.product },
        update: { $inc: { stock: item.quantity } },
      },
    }))
  );

  order.status = "CANCELLED";

  await order.save();

  return order;
};
