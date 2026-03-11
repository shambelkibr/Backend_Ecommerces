const {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
} = require("../models/productModel");
const { getLatestSellerLicense } = require("../models/licenseModel");

async function createProductHandler(req, res) {
  try {
    const { categoryId, name, description, price, quantity } = req.body;

    if (!name || !price || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "name, price and quantity are required" });
    }

    const license = await getLatestSellerLicense(req.user.id);
    if (!license || license.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Seller license is not approved" });
    }

    const product = await createProduct({
      sellerId: req.user.id,
      categoryId,
      name,
      description,
      price,
      quantity,
      imagePath: req.file ? `/uploads/products/${req.file.filename}` : null,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function listProductsHandler(req, res) {
  try {
    const products = await listProducts();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getProductHandler(req, res) {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function updateProductHandler(req, res) {
  try {
    const { categoryId, name, description, price, quantity } = req.body;

    const updated = await updateProduct(req.params.id, req.user.id, {
      categoryId,
      name,
      description,
      price,
      quantity,
      imagePath: req.file ? `/uploads/products/${req.file.filename}` : null,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function deleteProductHandler(req, res) {
  try {
    const success = await deleteProduct(req.params.id, req.user.id);

    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createProductHandler,
  listProductsHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
};
