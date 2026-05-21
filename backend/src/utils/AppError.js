/**
 * AppError.js — Custom operational error class
 *
 * Phân biệt 2 loại lỗi:
 * - isOperational = true  → Lỗi nghiệp vụ có thể dự đoán được (404, 400, 401, 409...)
 *                           Trả về cho client, log ở mức warn
 * - isOperational = false → Bug thật sự hoặc lỗi hệ thống
 *                           Log ở mức error, không leak details ra client
 */
class AppError extends Error {
  /**
   * @param {string} message   - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code]    - Machine-readable error code (optional, for FE to handle)
   * @param {Error}  [cause]   - Original error that caused this (for debugging)
   */
  constructor(message, statusCode = 500, code = null, cause = null) {
    super(message);

    this.statusCode = statusCode;
    this.code = code || _defaultCode(statusCode);
    this.isOperational = true;
    this.cause = cause;

    // Ghi lại stack trace đúng chỗ (bỏ qua constructor này)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Tự sinh error code từ status code nếu không truyền code
 */
const _defaultCode = (status) => {
  const codes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE',
    429: 'TOO_MANY_REQUESTS',
    500: 'INTERNAL_ERROR',
  };
  return codes[status] || 'INTERNAL_ERROR';
};

module.exports = AppError;
