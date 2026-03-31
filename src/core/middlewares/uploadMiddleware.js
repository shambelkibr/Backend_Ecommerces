const path = require("path");
const fs = require("fs");
const multer = require("multer");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const licenseDir = path.join(__dirname, "..", "uploads", "licenses");
const productDir = path.join(__dirname, "..", "uploads", "products");

ensureDir(licenseDir);
ensureDir(productDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "license") {
      return cb(null, licenseDir);
    }

    if (file.fieldname === "image") {
      return cb(null, productDir);
    }

    return cb(new Error("Unknown upload field"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }

  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
