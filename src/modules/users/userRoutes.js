const express = require("express");
const { getAllUsers, deleteUser } = require("./userController");
const authMiddleware = require("../../core/middlewares/authMiddleware");
const { adminMiddleware } = require("../../core/middlewares/adminMiddleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/:id", authMiddleware, adminMiddleware, deleteUser);

module.exports = router;
