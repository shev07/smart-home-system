/**
 * response.js — Standardized HTTP response formatters
 *
 * Mọi response đều có shape nhất quán:
 * Success: { success: true,  message, data }
 * Error:   { success: false, message, code }
 */

/**
 * Gửi response thành công
 * @param {object} res        - Express response object
 * @param {any}    data       - Payload trả về
 * @param {string} message    - Message mô tả
 * @param {number} statusCode - HTTP status (default: 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Gửi response lỗi (thường dùng trong error middleware, không dùng trực tiếp trong controller)
 * @param {object} res        - Express response object
 * @param {string} message    - Error message
 * @param {number} statusCode - HTTP status (default: 500)
 * @param {string} code       - Machine-readable error code
 */
const errorResponse = (res, message, statusCode = 500, code = 'INTERNAL_ERROR') => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
  });
};

module.exports = { successResponse, errorResponse };
