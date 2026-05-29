const express = require("express");
const db = require("../database/db");
const auth = require("../middleware/auth");
const { toPublicMediaPath } = require("../utils/mediaPath");

const router = express.Router();

function mapLogRow(row) {
  return {
    ...row,
    image_path: toPublicMediaPath(row.image_path),
    video_path: toPublicMediaPath(row.video_path),
  };
}

router.get("/", auth.any(), (req, res) => {
  const { status, limit = "100" } = req.query;
  let sql = `
    SELECT id, visitor_id, name, status, timestamp, image_path, video_path
    FROM logs
  `;
  const params = [];

  if (status && status !== "ALL") {
    sql += " WHERE status = ?";
    params.push(status);
  }

  sql += " ORDER BY timestamp DESC LIMIT ?";
  params.push(Math.min(parseInt(limit, 10) || 100, 500));

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(rows.map(mapLogRow));
  });
});

module.exports = router;
