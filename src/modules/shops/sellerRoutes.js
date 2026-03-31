const express = require("express");
const {
  uploadLicense,
  myLicense,
  getPendingLicenses,
  reviewSellerLicense,
} = require("./sellerController");
const authMiddleware = require("../../core/middlewares/authMiddleware");
const {
  adminMiddleware,
  sellerMiddleware,
} = require("../../core/middlewares/adminMiddleware");
const upload = require("../../core/middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/license/upload",
  authMiddleware,
  sellerMiddleware,
  upload.single("license"),
  uploadLicense,
);
router.get("/license/me", authMiddleware, sellerMiddleware, myLicense);

router.get(
  "/licenses/pending",
  authMiddleware,
  adminMiddleware,
  getPendingLicenses,
);
router.patch(
  "/licenses/:id/review",
  authMiddleware,
  adminMiddleware,
  reviewSellerLicense,
);

module.exports = router;
