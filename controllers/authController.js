const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { createUser, findByEmail, findById } = require("../models/userModel");

function buildToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" },
  );
}

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email,
      passwordHash,
      role: role || "buyer",
    });

    const token = buildToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = buildToken(user);
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = {
  register,
  login,
  me,
};
