const pool = require("../../config/db");

async function createShop({ sellerId, name, description, address }) {
  const [result] = await pool.execute(
    `INSERT INTO shops (seller_id, name, description, address, status)
                 VALUES (?, ?, ?, ?, 'pending')`,
    [sellerId, name, description, address],
  );

  return getShopById(result.insertId);
}

async function getShopById(id) {
  const [rows] = await pool.execute(
    `SELECT s.*, u.name AS seller_name, u.email AS seller_email
                 FROM shops s
                 JOIN users u ON u.id = s.seller_id
                 WHERE s.id = ?`,
    [id],
  );

  return rows[0] || null;
}

async function getShopBySellerId(sellerId) {
  const [rows] = await pool.execute(
    `SELECT *
                 FROM shops
                 WHERE seller_id = ?
     ORDER BY created_at DESC
                 LIMIT 1`,
    [sellerId],
  );

  return rows[0] || null;
}

async function listPendingShops() {
  const [rows] = await pool.execute(
    `SELECT s.*, u.name AS seller_name, u.email AS seller_email
                 FROM shops s
                 JOIN users u ON u.id = s.seller_id
                 WHERE s.status = 'pending'
     ORDER BY s.created_at ASC`,
  );

  return rows;
}

async function reviewShop({ shopId, status }) {
  await pool.execute(
    `UPDATE shops
                 SET status = ?
                 WHERE id = ?`,
    [status, shopId],
  );

  return getShopById(shopId);
}

module.exports = {
  createShop,
  getShopById,
  getShopBySellerId,
  listPendingShops,
  reviewShop,
};
