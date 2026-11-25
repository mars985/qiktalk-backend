const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  if (err.name === "MulterError") {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
};

module.exports = { errorHandler };
