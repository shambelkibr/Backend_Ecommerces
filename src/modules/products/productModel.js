const pool = require("../../config/db");

async function createProduct({
  shopId,
  categoryId,
  name,
  description,
  price,
  quantity,
  imagePath,
}) {
  const [result] = await pool.execute(
    `INSERT INTO products (shop_id, category_id, name, description, base_price)
                 VALUES (?, ?, ?, ?, ?)`,
    [
      shopId,
      categoryId || null,
      name,
      description || null,
      price
    ]
  );
  
  if (imagePath) {
    await pool.execute(
      `INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, true)`,
      [result.insertId, imagePath]
    );
  }

  return getProductById(result.insertId);
}

// Map database row outputs into structured front-end friendly objects
function parseProductRows(rows) {
  if (rows.length === 0) return [];
  
  const productMap = {};
  
  for (const row of rows) {
    if (!productMap[row.id]) {
      productMap[row.id] = {
        id: row.id,
        shop_id: row.shop_id,
        category: row.category,
        name: row.name,
        description: row.description,
        price: Number(row.base_price),
        status: row.status,
        image: row.image_url,
        shop_name: row.shop_name,
        variants: []
      };
    }
    
    // Add variant if present
    if (row.variant_id) {
       // Only push unique variants
       if (!productMap[row.id].variants.find(v => v.id === row.variant_id)) {
           productMap[row.id].variants.push({
             id: row.variant_id,
             size: row.size,
             color: row.color,
             sku: row.sku,
             quantity: row.quantity
           });
       }
    }
  }
  
  return Object.values(productMap);
}

const baseSelect = `
    SELECT 
      p.id, p.shop_id, p.name, p.description, p.base_price, p.status,
      CASE p.category_id WHEN 1 THEN 'Men' WHEN 2 THEN 'Women' ELSE 'Unisex' END as category,
      s.name AS shop_name,
      img.image_url,
      v.id as variant_id, v.size, v.color, v.sku, v.quantity
    FROM products p
    JOIN shops s ON s.id = p.shop_id
    LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = true
    LEFT JOIN product_variants v ON v.product_id = p.id
`;

async function getProductById(id) {
  const [rows] = await pool.execute(`${baseSelect} WHERE p.id = ?`, [id]);
  const products = parseProductRows(rows);
  return products.length > 0 ? products[0] : null;
}

async function listProducts() {
  const [rows] = await pool.execute(`${baseSelect} ORDER BY p.created_at DESC`);
  return parseProductRows(rows);
}

async function updateProduct(id, shopId, data) {
  const { categoryId, name, description, price, status } = data;

  await pool.execute(
    `UPDATE products
                 SET category_id = COALESCE(?, category_id), 
                     name = COALESCE(?, name), 
                     description = COALESCE(?, description), 
                     base_price = COALESCE(?, base_price), 
                     status = COALESCE(?, status)
                 WHERE id = ? AND shop_id = ?`,
    [categoryId, name, description, price, status, id, shopId],
  );

  return getProductById(id);
}

async function deleteProduct(id, shopId) {
  const [result] = await pool.execute(
    "DELETE FROM products WHERE id = ? AND shop_id = ?",
    [id, shopId],
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
