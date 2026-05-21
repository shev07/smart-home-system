/**
 * asyncHandler.js — Async route wrapper
 *
 * Bọc async controller functions để tự động catch lỗi
 * và forward đến Express global error handler (next(err))
 * Thay thế try/catch lặp lại trong mỗi controller
 *
 * Usage:
 *   router.get('/path', asyncHandler(controller.method))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
