const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const initDb = require("./src/config/initDb");
const authRoutes = require("./src/modules/auth/authRoutes");
const productRoutes = require("./src/modules/products/productRoutes");
const sellerRoutes = require("./src/modules/shops/sellerRoutes");
const orderRoutes = require("./src/modules/orders/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Debre Birhan Local Clothes Ecommerce API Running");
});

app.use((err, req, res, next) => {
  if (err && err.message) {
    return res.status(400).json({ message: err.message });
  }
  return next();
});

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });
