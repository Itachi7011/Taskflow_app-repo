// middleware/errorHandler.js
// catches anything passed to next(err) so we dont repeat try/catch
// boilerplate everywhere and every error response looks the same shape
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong on the server";

  // mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id format";
  }

  // mongoose duplicate key (like email already registered)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already in use`;
  }

  // mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = errorHandler;
