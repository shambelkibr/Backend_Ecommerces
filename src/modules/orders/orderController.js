const {
  addToCart,
  getCartItems,
  removeFromCart,
  checkoutAndCreateOrder,
  getOrderById,
  listOrdersByBuyer,
  listOrdersBySeller,
  updateOrderStatus,
} = require("./orderModel");
const { initiatePayment, verifyPayment } = require("../payments/paymentService");

async function addToCartHandler(req, res) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "productId and positive quantity are required" });
    }

    const cart = await addToCart({
      buyerId: req.user.id,
      productId,
      quantity,
    });

    return res.status(201).json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getCartHandler(req, res) {
  try {
    const cart = await getCartItems(req.user.id);
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function removeFromCartHandler(req, res) {
  try {
    const cart = await removeFromCart({
      buyerId: req.user.id,
      productId: req.params.productId,
    });
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function checkoutHandler(req, res) {
  try {
    const order = await checkoutAndCreateOrder(req.user.id);
    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function initiatePaymentHandler(req, res) {
  try {
    const order = await getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      Number(order.buyer_id) !== Number(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const payment = await initiatePayment({
      orderId: order.id,
      amount: order.total_price,
    });

    return res.status(201).json(payment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function verifyPaymentHandler(req, res) {
  try {
    const { txRef } = req.body;

    if (!txRef) {
      return res.status(400).json({ message: "txRef is required" });
    }

    const result = await verifyPayment(txRef);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

async function updateOrderStatusHandler(req, res) {
  try {
    const { status } = req.body;
    const allowed = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const updated = await updateOrderStatus(req.params.orderId, status);
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function myOrdersHandler(req, res) {
  try {
    const orders = await listOrdersByBuyer(req.user.id);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function sellerOrdersHandler(req, res) {
  try {
    const orders = await listOrdersBySeller(req.user.id);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  addToCartHandler,
  getCartHandler,
  removeFromCartHandler,
  checkoutHandler,
  initiatePaymentHandler,
  verifyPaymentHandler,
  updateOrderStatusHandler,
  myOrdersHandler,
  sellerOrdersHandler,
};
