const {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
} = require("./productModel");
const { getShopBySellerId } = require("../shops/shopModel");

async function createProductHandler(req, res) {
  try {
    const { categoryId, name, description, price, quantity } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ message: "name and price are required" });
    }

    const shop = await getShopBySellerId(req.user.id);
    if (!shop || shop.status !== "approved") {
      return res
        .status(403)
        .json({ message: "Your shop is not approved to sell products yet." });
    }

    const product = await createProduct({
      shopId: shop.id,
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
    const { categoryId, name, description, price, status } = req.body;

    const shop = await getShopBySellerId(req.user.id);
    if (!shop) {
       return res.status(403).json({ message: "Shop not found" });
    }

    const updated = await updateProduct(req.params.id, shop.id, {
      categoryId,
      name,
      description,
      price,
      status,
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
    const shop = await getShopBySellerId(req.user.id);
    if (!shop) {
       return res.status(403).json({ message: "Shop not found" });
    }

    const success = await deleteProduct(req.params.id, shop.id);

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
