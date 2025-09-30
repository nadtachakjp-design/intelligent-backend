const { auth } = require("../middleware/auth");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

router.get("/users", auth("admin"), async (_req, res) => {
  try {
    const rows = await User.find().sort({ createdAt: -1 }).lean();
    const mapped = rows.map((r) => ({
      _id: r._id,
      username: r.username,
      email: r.email,
      roleName: r.role || null,
      createdAt: r.createdAt,
    }));
    res.json(mapped);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/users", auth("admin"), async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body || {};

    if (!username || !email || !password || !roleName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["admin", "user"].includes(roleName)) {
      return res.status(400).json({ message: "Invalid role name" });
    }

    const existed = await User.findOne({ $or: [{ username }, { email }] });
    if (existed) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password_hash,
      role: roleName,
    });

    return res.status(201).json(user.toSafeJSON());
  } catch (err) {
    console.error("Create user error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
router.delete("/users/:id", auth("admin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ ok: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/users/:id", auth("admin"), async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (email) updates.email = email;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.toSafeJSON());
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/users/list", auth(), async (_req, res) => {
  try {
    const rows = await User.find()
      .select("_id username email")
      .sort({ username: 1 })
      .lean();

    const mapped = rows.map((u) => ({
      id: u._id,
      name: u.username,
      email: u.email,
    }));

    res.json(mapped);
  } catch (err) {
    console.error("User list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
