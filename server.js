const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const initDb = require("./config/initDb");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Areke Ecommerce API Running");
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
