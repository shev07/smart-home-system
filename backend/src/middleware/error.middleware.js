const AppError = require('../utils/AppError');

/**
 * Global error handler — phải là middleware cuối cùng được mount trong app.js
 * Express nhận dạng error handler qua signature 4 tham số: (err, req, res, next)
 */
const errorHandler = (err, _req, res, _next) => {
  // ── Operational errors (AppError) ──────────────────────────────
  // Lỗi có thể dự đoán được: 404, 400, 401, 409...
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // ── Mongoose Validation Error ──────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      code: 'VALIDATION_ERROR',
    });
  }

  // ── Mongoose Duplicate Key (unique index violation) ────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: 'DUPLICATE_KEY',
    });
  }

  // ── Mongoose Bad ObjectId ──────────────────────────────────────
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      code: 'INVALID_ID',
    });
  }

  // ── JWT Errors ─────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }

  // ── Unknown / Programming Errors ──────────────────────────────
  // Không leak stack trace ra client trong production
  console.error('🔴 UNHANDLED ERROR:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};

module.exports = { errorHandler };
