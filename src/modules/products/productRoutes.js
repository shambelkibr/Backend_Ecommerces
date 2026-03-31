const express = require("express");
const {
  createProductHandler,
  listProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = require("./productController");
const authMiddleware = require("../../core/middlewares/authMiddleware");
const { sellerMiddleware } = require("../../core/middlewares/adminMiddleware");
const upload = require("../../core/middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", listProductsHandler);
router.get("/:id", getProductHandler);
router.post(
  "/",
  authMiddleware,
  sellerMiddleware,
  upload.single("image"),
  createProductHandler,
);
router.put(
  "/:id",
  authMiddleware,
  sellerMiddleware,
  upload.single("image"),
  updateProductHandler,
);
router.delete("/:id", authMiddleware, sellerMiddleware, deleteProductHandler);

module.exports = router;
