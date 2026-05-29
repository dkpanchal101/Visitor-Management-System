const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../database/db");
const auth = require("../middleware/auth");
const { getFaceDescriptor } = require("../face/faceService");

const router = express.Router();

const uploadDir = path.join(__dirname, "../media/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, or WebP images are allowed"));
  },
});

router.get("/", auth.any(), (req, res) => {
  db.all(
    "SELECT id, name, blacklisted, created_at FROM visitors ORDER BY name ASC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    }
  );
});

router.post(
  "/register",
  auth.any(),
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { name, blacklisted } = req.body;
      const isBlacklisted = blacklisted === "true" || blacklisted === true ? 1 : 0;

      if (!name?.trim() || !req.file) {
        return res.status(400).json({ error: "Name and photo are required" });
      }

      const result = await getFaceDescriptor(req.file.path);

      if (!result) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {}
        return res.status(400).json({
          error:
            "No face detected. Use a clear, front-facing photo with one person.",
        });
      }

      const descriptorStr = JSON.stringify(Array.from(result.descriptor));

      db.run(
        "INSERT INTO visitors (name, face_descriptor, blacklisted) VALUES (?, ?, ?)",
        [name.trim(), descriptorStr, isBlacklisted],
        function (err) {
          if (err) return res.status(500).json({ error: "Failed to save visitor" });
          res.status(201).json({
            success: true,
            id: this.lastID,
            name: name.trim(),
            blacklisted: !!isBlacklisted,
          });
        }
      );
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", auth.any(), (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM visitors WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Database error" });
    if (this.changes === 0) return res.status(404).json({ error: "Visitor not found" });
    res.json({ success: true });
  });
});

module.exports = router;
