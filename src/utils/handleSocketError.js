const { ApiError } = require("./ApiError");

const handleSocketError = (err, callback) => {
  const error =
    err instanceof ApiError
      ? err
      : new ApiError(500, err.message || "Internal Server Error");

  callback?.({
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors,
  });
};

module.exports = { handleSocketError };
