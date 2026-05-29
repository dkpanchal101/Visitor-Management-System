const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
};

function normalizeRole(role) {
  if (!role) return ROLES.ADMIN;
  const upper = String(role).toUpperCase();
  if (upper === "SUPERADMIN" || upper === "SUPER_ADMIN") return ROLES.SUPER_ADMIN;
  if (upper === "ADMIN") return ROLES.ADMIN;
  return upper;
}

module.exports = { ROLES, normalizeRole };
