const pool = require("../../config/db");

async function createUser({ name, email, passwordHash, role = "buyer" }) {
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, passwordHash, role],
  );

  return { id: result.insertId, name, email, role };
}

async function findByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
};
