const db = require("../database/db");

const COOLDOWN_MS =
  (parseInt(process.env.LOG_COOLDOWN_SECONDS, 10) || 45) * 1000;

/**
 * Returns the most recent log id if this detection should be skipped (cooldown).
 */
function findRecentLog({ name, status, visitorId }) {
  const since = new Date(Date.now() - COOLDOWN_MS).toISOString();

  return new Promise((resolve, reject) => {
    if (visitorId) {
      db.get(
        `SELECT id FROM logs
         WHERE visitor_id = ? AND timestamp > ?
         ORDER BY id DESC LIMIT 1`,
        [visitorId, since],
        (err, row) => (err ? reject(err) : resolve(row?.id ?? null))
      );
      return;
    }

    if (status === "UNKNOWN" || name === "NO FACE") {
      db.get(
        `SELECT id FROM logs
         WHERE status = 'UNKNOWN' AND timestamp > ?
         ORDER BY id DESC LIMIT 1`,
        [since],
        (err, row) => (err ? reject(err) : resolve(row?.id ?? null))
      );
      return;
    }

    db.get(
      `SELECT id FROM logs
       WHERE name = ? AND status = ? AND timestamp > ?
       ORDER BY id DESC LIMIT 1`,
      [name, status, since],
      (err, row) => (err ? reject(err) : resolve(row?.id ?? null))
    );
  });
}

module.exports = { findRecentLog, COOLDOWN_MS };
