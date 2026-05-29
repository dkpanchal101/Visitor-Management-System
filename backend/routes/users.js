const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const auth = require("../middleware/auth");
const { ROLES, normalizeRole } = require("../constants/roles");

const router = express.Router();

router.get("/", auth(ROLES.SUPER_ADMIN), (req, res) => {
  db.all(
    "SELECT id, username, role, created_at FROM users ORDER BY username ASC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows.map((r) => ({ ...r, role: normalizeRole(r.role) })));
    }
  );
});

router.post("/", auth(ROLES.SUPER_ADMIN), async (req, res) => {
  const { username, password, role } = req.body;

  if (!username?.trim() || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const normalizedRole = normalizeRole(role);
  if (![ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(normalizedRole)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username.trim(), hashedPassword, normalizedRole],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Username already exists" });
          }
          return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ success: true, id: this.lastID });
      }
    );
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", auth(ROLES.SUPER_ADMIN), (req, res) => {
  const userId = req.params.id;

  if (String(req.user.id) === String(userId)) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

  db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "User not found" });
    res.json({ success: true });
  });
});

module.exports = router;
