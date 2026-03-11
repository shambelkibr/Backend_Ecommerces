const pool = require("../config/db");

async function createProduct({
  sellerId,
  categoryId,
  name,
  description,
  price,
  quantity,
  imagePath,
}) {
  const [result] = await pool.execute(
    `INSERT INTO products (seller_id, category_id, name, description, price, quantity, image)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sellerId,
      categoryId || null,
      name,
      description || null,
      price,
      quantity,
      imagePath || null,
    ],
  );

  return getProductById(result.insertId);
}

async function getProductById(id) {
  const [rows] = await pool.execute(
    `SELECT p.*, u.name AS seller_name
		 FROM products p
		 JOIN users u ON u.id = p.seller_id
		 WHERE p.id = ?`,
    [id],
  );

  return rows[0] || null;
}

async function listProducts() {
  const [rows] = await pool.execute(
    `SELECT p.*, u.name AS seller_name
		 FROM products p
		 JOIN users u ON u.id = p.seller_id
		 ORDER BY p.created_at DESC`,
  );

  return rows;
}

async function updateProduct(id, sellerId, data) {
  const { categoryId, name, description, price, quantity, imagePath } = data;

  await pool.execute(
    `UPDATE products
		 SET category_id = ?, name = ?, description = ?, price = ?, quantity = ?, image = COALESCE(?, image)
		 WHERE id = ? AND seller_id = ?`,
    [
      categoryId || null,
      name,
      description || null,
      price,
      quantity,
      imagePath || null,
      id,
      sellerId,
    ],
  );

  return getProductById(id);
}

async function deleteProduct(id, sellerId) {
  const [result] = await pool.execute(
    "DELETE FROM products WHERE id = ? AND seller_id = ?",
    [id, sellerId],
  );

  return result.affectedRows > 0;
}

module.exports = {
  createProduct,
  getProductById,
  listProducts,
  updateProduct,
  deleteProduct,
};
