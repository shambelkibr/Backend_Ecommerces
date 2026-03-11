const express = require("express");
const {
  uploadLicense,
  myLicense,
  getPendingLicenses,
  reviewSellerLicense,
} = require("../controllers/sellerController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  adminMiddleware,
  sellerMiddleware,
} = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

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
