const express = require("express");
const {
  addToCartHandler,
  getCartHandler,
  removeFromCartHandler,
  checkoutHandler,
  initiatePaymentHandler,
  verifyPaymentHandler,
  updateOrderStatusHandler,
  myOrdersHandler,
  sellerOrdersHandler,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  adminMiddleware,
  sellerMiddleware,
} = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/cart", authMiddleware, addToCartHandler);
router.get("/cart", authMiddleware, getCartHandler);
router.delete("/cart/:productId", authMiddleware, removeFromCartHandler);
router.post("/checkout", authMiddleware, checkoutHandler);

router.get("/my", authMiddleware, myOrdersHandler);
router.get("/seller", authMiddleware, sellerMiddleware, sellerOrdersHandler);

router.post(
  "/:orderId/payment/initiate",
  authMiddleware,
  initiatePaymentHandler,
);
router.post("/payment/verify", authMiddleware, verifyPaymentHandler);

router.patch(
  "/:orderId/status",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role === "seller" || req.user.role === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Seller or admin access required" });
  },
  updateOrderStatusHandler,
);

router.get("/admin/protected", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Admin route is active" });
});

module.exports = router;
