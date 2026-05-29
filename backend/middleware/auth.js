const jwt = require("jsonwebtoken");
const { ROLES, normalizeRole } = require("../constants/roles");

const SECRET = process.env.JWT_SECRET;

if (!SECRET && process.env.NODE_ENV === "production") {
  console.error("FATAL: JWT_SECRET must be set in production");
  process.exit(1);
}

const JWT_SECRET = SECRET || "dev-only-secret-change-in-production";

function auth(requiredRole = null) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        ...decoded,
        role: normalizeRole(decoded.role),
      };

      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    } catch {
      return res.status(401).json({ error: "Session expired or invalid token" });
    }
  };
}

auth.any = () => auth(null);

module.exports = auth;
module.exports.JWT_SECRET = JWT_SECRET;
module.exports.ROLES = ROLES;
