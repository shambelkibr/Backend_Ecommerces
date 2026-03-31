const db = require("../../config/db");

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin
    const [userCheck] = await db.query("SELECT role FROM users WHERE id = ?", [id]);
    if (userCheck.length > 0 && userCheck[0].role === 'admin') {
      return res.status(403).json({ message: "Cannot delete an admin user" });
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
