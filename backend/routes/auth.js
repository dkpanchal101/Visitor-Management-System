const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const auth = require("../middleware/auth");
const { normalizeRole } = require("../constants/roles");

const router = express.Router();
const { JWT_SECRET } = auth;

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  db.get(
    "SELECT * FROM users WHERE username = ? COLLATE NOCASE",
    [username.trim()],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: "Invalid username or password" });
        }

        const role = normalizeRole(user.role);

        const token = jwt.sign(
          { id: user.id, username: user.username, role },
          JWT_SECRET,
          { expiresIn: "8h" }
        );

        res.json({
          token,
          role,
          username: user.username,
        });
      } catch {
        res.status(500).json({ error: "Authentication error" });
      }
    }
  );
});

router.get("/me", auth.any(), (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
  });
});

module.exports = router;
