const express = require("express");
const {
  createProductHandler,
  listProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { sellerMiddleware } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

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
