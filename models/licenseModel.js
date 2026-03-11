const pool = require("../config/db");

async function createLicense({ sellerId, filePath }) {
  const [result] = await pool.execute(
    `INSERT INTO seller_licenses (seller_id, license_file, status)
		 VALUES (?, ?, 'pending')`,
    [sellerId, filePath],
  );

  return getLicenseById(result.insertId);
}

async function getLicenseById(id) {
  const [rows] = await pool.execute(
    `SELECT l.*, u.name AS seller_name, u.email AS seller_email
		 FROM seller_licenses l
		 JOIN users u ON u.id = l.seller_id
		 WHERE l.id = ?`,
    [id],
  );

  return rows[0] || null;
}

async function getLatestSellerLicense(sellerId) {
  const [rows] = await pool.execute(
    `SELECT *
		 FROM seller_licenses
		 WHERE seller_id = ?
     ORDER BY uploaded_at DESC
		 LIMIT 1`,
    [sellerId],
  );

  return rows[0] || null;
}

async function listPendingLicenses() {
  const [rows] = await pool.execute(
    `SELECT l.*, u.name AS seller_name, u.email AS seller_email
		 FROM seller_licenses l
		 JOIN users u ON u.id = l.seller_id
		 WHERE l.status = 'pending'
     ORDER BY l.uploaded_at ASC`,
  );

  return rows;
}

async function reviewLicense({ licenseId, status }) {
  await pool.execute(
    `UPDATE seller_licenses
		 SET status = ?
		 WHERE id = ?`,
    [status, licenseId],
  );

  return getLicenseById(licenseId);
}

module.exports = {
  createLicense,
  getLicenseById,
  getLatestSellerLicense,
  listPendingLicenses,
  reviewLicense,
};
