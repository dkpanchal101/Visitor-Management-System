const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../database/db");
const auth = require("../middleware/auth");
const { getFaceDescriptor, euclideanDistance } = require("../face/faceService");
const { toStoredMediaPath } = require("../utils/mediaPath");
const { findRecentLog } = require("../utils/logDedup");

const router = express.Router();
const MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.55");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith("video")
      ? path.join(__dirname, "../media/videos")
      : path.join(__dirname, "../media/snapshots");
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1]?.split(";")[0] || "bin";
    cb(null, `${Date.now()}.${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /^(image\/(jpeg|jpg|png|webp)|video\/webm|video\/mp4)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

function discardSnapshot(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

router.post("/", auth.any(), upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    let result;
    try {
      result = await getFaceDescriptor(req.file.path);
    } catch (faceErr) {
      console.error("Face pipeline error:", faceErr);
      discardSnapshot(req.file.path);
      return res.status(500).json({
        error: "Face detection failed",
        name: "NO FACE",
        status: "UNKNOWN",
        box: null,
      });
    }

    if (!result) {
      discardSnapshot(req.file.path);
      return res.json({ name: "NO FACE", status: "UNKNOWN", box: null });
    }

    const { descriptor: inputDescriptor, box } = result;
    const imagePathStored = toStoredMediaPath(req.file.path);

    db.all("SELECT * FROM visitors", [], async (err, visitors) => {
      if (err) {
        discardSnapshot(req.file.path);
        return res.status(500).json({ error: "Database error" });
      }

      let bestMatch = null;
      let minDistance = MATCH_THRESHOLD;

      visitors.forEach((visitor) => {
        if (!visitor.face_descriptor) return;
        const storedDescriptor = new Float32Array(
          JSON.parse(visitor.face_descriptor)
        );
        const distance = euclideanDistance(inputDescriptor, storedDescriptor);

        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = visitor;
        }
      });

      const name = bestMatch ? bestMatch.name : "UNKNOWN";
      const status = bestMatch
        ? bestMatch.blacklisted
          ? "BLACKLISTED"
          : "AUTHORIZED"
        : "UNKNOWN";

      try {
        const recentLogId = await findRecentLog({
          name,
          status,
          visitorId: bestMatch?.id ?? null,
        });

        if (recentLogId) {
          discardSnapshot(req.file.path);
          return res.json({
            name,
            status,
            distance: minDistance,
            box,
            logId: null,
            deduped: true,
          });
        }
      } catch (dedupErr) {
        console.error("Dedup check failed:", dedupErr);
      }

      if (status === "AUTHORIZED" && bestMatch) {
        db.get(
          "SELECT * FROM visits WHERE visitor_id = ? AND check_out IS NULL",
          [bestMatch.id],
          (err, visit) => {
            if (!visit) {
              db.run(
                "INSERT INTO visits (visitor_id, name, check_in) VALUES (?, ?, ?)",
                [bestMatch.id, name, new Date().toISOString()]
              );
            } else {
              const now = new Date();
              const diffMinutes =
                (now - new Date(visit.check_in)) / 1000 / 60;
              if (diffMinutes > 1) {
                const duration = `${Math.round(diffMinutes)} mins`;
                db.run(
                  "UPDATE visits SET check_out = ?, duration = ? WHERE id = ?",
                  [now.toISOString(), duration, visit.id]
                );
              }
            }
          }
        );
      }

      const query = `INSERT INTO logs (visitor_id, name, status, image_path, timestamp) VALUES (?, ?, ?, ?, ?)`;

      db.run(
        query,
        [
          bestMatch?.id || null,
          name,
          status,
          imagePathStored,
          new Date().toISOString(),
        ],
        function (err) {
          if (err) {
            discardSnapshot(req.file.path);
            return res.status(500).json({ error: "Failed to save log" });
          }

          const logId = this.lastID;

          if (status === "BLACKLISTED" || status === "UNKNOWN") {
            const io = req.app.get("io");
            if (io) io.emit("alert", { name, status, image: imagePathStored });
          }

          res.json({
            name,
            status,
            distance: minDistance,
            box,
            logId,
          });
        }
      );
    });
  } catch (error) {
    next(error);
  }
});

router.post("/video", auth.any(), upload.single("video"), (req, res) => {
  const { logId } = req.body;
  if (!req.file || !logId) {
    return res.status(400).json({ error: "Missing video or log ID" });
  }

  const videoPathStored = toStoredMediaPath(req.file.path);

  db.run(
    "UPDATE logs SET video_path = ? WHERE id = ?",
    [videoPathStored, logId],
    (err) => {
      if (err) return res.status(500).json({ error: "Failed to attach video" });
      res.json({ success: true, videoPath: videoPathStored });
    }
  );
});

module.exports = router;
