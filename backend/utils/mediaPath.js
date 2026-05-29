const path = require("path");

/** Store paths like media/snapshots/123.jpg (works with express.static /media) */
function toStoredMediaPath(absolutePath) {
  if (!absolutePath) return null;
  const normalized = absolutePath.replace(/\\/g, "/");
  const idx = normalized.indexOf("media/");
  if (idx >= 0) return normalized.slice(idx);
  return path
    .relative(path.join(__dirname, ".."), absolutePath)
    .replace(/\\/g, "/");
}

/** Normalize DB value (absolute or relative) to public URL path segment */
function toPublicMediaPath(stored) {
  if (!stored) return null;
  const normalized = String(stored).replace(/\\/g, "/");
  const idx = normalized.indexOf("media/");
  if (idx >= 0) return normalized.slice(idx);
  return normalized.replace(/^\.?\//, "");
}

module.exports = { toStoredMediaPath, toPublicMediaPath };
