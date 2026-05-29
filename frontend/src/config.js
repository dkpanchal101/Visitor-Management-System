const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MEDIA_BASE = import.meta.env.VITE_MEDIA_URL || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
};

export function mediaUrl(filePath) {
  if (!filePath) return null;
  const normalized = String(filePath).replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;

  const mediaIdx = normalized.indexOf("media/");
  const relative =
    mediaIdx >= 0
      ? normalized.slice(mediaIdx)
      : normalized.replace(/^\.?\//, "");

  return `${MEDIA_BASE.replace(/\/$/, "")}/${relative}`;
}

export { API_BASE, MEDIA_BASE, SOCKET_URL };
