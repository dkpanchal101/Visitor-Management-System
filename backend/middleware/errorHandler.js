function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large" });
  }
  if (err.message === "Invalid file type" || err.message?.includes("images are allowed")) {
    return res.status(400).json({ error: err.message });
  }
  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status === 500
      ? "Internal server error"
      : err.message || "Internal server error";
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
