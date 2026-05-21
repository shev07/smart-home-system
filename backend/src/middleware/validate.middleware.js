const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Tạo middleware validate request body với Joi schema
 * @param {Joi.Schema} schema - Joi schema để validate
 * @returns Express middleware
 *
 * Usage:
 *   router.post('/register', validateBody(authValidator.registerSchema), controller.register)
 */
const validateBody = (schema) => (req, _res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,   // Trả về tất cả lỗi cùng lúc, không dừng ở lỗi đầu tiên
    stripUnknown: true,  // Tự động loại bỏ các field không khai báo trong schema
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new AppError(message, 400, 'VALIDATION_ERROR'));
  }

  next();
};

/**
 * Tạo middleware validate query params với Joi schema
 * @param {Joi.Schema} schema
 */
const validateQuery = (schema) => (req, _res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true, // Tự convert string → number/boolean khi cần
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new AppError(message, 400, 'VALIDATION_ERROR'));
  }

  req.query = value; // Ghi đè query với giá trị đã được coerce/sanitize
  next();
};

module.exports = { validateBody, validateQuery };
