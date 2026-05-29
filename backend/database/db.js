const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bcrypt = require("bcryptjs");
const { ROLES } = require("../constants/roles");

const dbPath = path.join(__dirname, "vms.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Connection Error:", err.message);
  else console.log("Connected to SQLite database.");
});

db.configure("busyTimeout", 5000);

db.serialize(() => {
  db.run("PRAGMA journal_mode = WAL;");

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    face_descriptor TEXT,
    blacklisted INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id INTEGER,
    name TEXT,
    status TEXT,
    image_path TEXT,
    video_path TEXT,
    timestamp TEXT,
    FOREIGN KEY(visitor_id) REFERENCES visitors(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id INTEGER,
    name TEXT,
    check_in TEXT,
    check_out TEXT,
    duration TEXT,
    FOREIGN KEY(visitor_id) REFERENCES visitors(id)
  )`);

  // Migrate legacy role strings
  db.run(
    `UPDATE users SET role = ? WHERE LOWER(role) IN ('superadmin', 'super_admin')`,
    [ROLES.SUPER_ADMIN]
  );
  db.run(`UPDATE users SET role = ? WHERE LOWER(role) = 'admin'`, [ROLES.ADMIN]);

  db.get("SELECT count(*) as count FROM users", (err, row) => {
    if (row && row.count === 0) {
      const adminPass = bcrypt.hashSync("admin123", 10);
      const superPass = bcrypt.hashSync("super123", 10);

      const stmt = db.prepare(
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)"
      );
      stmt.run("admin", adminPass, ROLES.ADMIN);
      stmt.run("superadmin", superPass, ROLES.SUPER_ADMIN);
      stmt.finalize();
      console.log("Default users created (change passwords in production).");
    }
  });
});

module.exports = db;
