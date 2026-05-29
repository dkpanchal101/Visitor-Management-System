const express = require("express");
const db = require("../database/db");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth.any(), (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const queries = {
    visitors: "SELECT COUNT(*) as count FROM visitors",
    blacklisted: "SELECT COUNT(*) as count FROM visitors WHERE blacklisted = 1",
    logsToday: `SELECT COUNT(*) as count FROM logs WHERE date(timestamp) = date(?)`,
    onSite: "SELECT COUNT(*) as count FROM visits WHERE check_out IS NULL",
    unknownToday: `SELECT COUNT(*) as count FROM logs WHERE status = 'UNKNOWN' AND date(timestamp) = date(?)`,
    blacklistedToday: `SELECT COUNT(*) as count FROM logs WHERE status = 'BLACKLISTED' AND date(timestamp) = date(?)`,
  };

  const results = {};
  let pending = Object.keys(queries).length;

  const done = () => {
    pending--;
    if (pending === 0) res.json(results);
  };

  db.get(queries.visitors, [], (err, row) => {
    results.registeredVisitors = row?.count ?? 0;
    done();
  });
  db.get(queries.blacklisted, [], (err, row) => {
    results.blacklistedVisitors = row?.count ?? 0;
    done();
  });
  db.get(queries.logsToday, [today], (err, row) => {
    results.detectionsToday = row?.count ?? 0;
    done();
  });
  db.get(queries.onSite, [], (err, row) => {
    results.visitorsOnSite = row?.count ?? 0;
    done();
  });
  db.get(queries.unknownToday, [today], (err, row) => {
    results.unknownToday = row?.count ?? 0;
    done();
  });
  db.get(queries.blacklistedToday, [today], (err, row) => {
    results.blacklistedAlertsToday = row?.count ?? 0;
    done();
  });
});

module.exports = router;
