const express = require("express");
const {
  registerShop,
  myShop,
  getPendingShops,
  reviewSellerShop,
} = require("./sellerController");
const authMiddleware = require("../../core/middlewares/authMiddleware");
const {
  adminMiddleware,
  sellerMiddleware,
} = require("../../core/middlewares/adminMiddleware");

const router = express.Router();

router.post("/shop/register", authMiddleware, sellerMiddleware, registerShop);
router.get("/shop/me", authMiddleware, sellerMiddleware, myShop);

router.get("/shops/pending", authMiddleware, adminMiddleware, getPendingShops);
router.patch("/shops/:id/review", authMiddleware, adminMiddleware, reviewSellerShop);

module.exports = router;
