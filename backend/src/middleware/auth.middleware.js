const jwt     = require('jsonwebtoken');
const User    = require('../models/User.model');
const AppError = require('../utils/AppError');

/**
 * authenticate — Middleware xác thực JWT
 * Gắn req.user sau khi xác thực thành công
 */
const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
    }

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash -__v');
    if (!user) return next(new AppError('User not found', 401, 'UNAUTHORIZED'));

    req.user = user;
    next();
  } catch (err) {
    // jwt.verify throw JsonWebTokenError / TokenExpiredError → caught by error middleware
    next(err);
  }
};

/**
 * deviceAuth — Middleware xác thực ESP32 bằng device secret key
 * ESP32 truyền key qua header: X-Device-Key: <DEVICE_SECRET_KEY>
 */
const deviceAuth = (req, _res, next) => {
  const deviceKey = req.headers['x-device-key'];
  if (!deviceKey || deviceKey !== process.env.DEVICE_SECRET_KEY) {
    return next(new AppError('Invalid device key', 401, 'DEVICE_UNAUTHORIZED'));
  }
  next();
};

/**
 * authorize — Middleware kiểm tra role sau khi đã authenticate
 * Sử dụng sau authenticate trong chuỗi middleware:
 *   router.get('/admin', authenticate, authorize('admin'), handler)
 *
 * @param {...string} roles - Danh sách roles được phép truy cập
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError('Not authenticated', 401, 'UNAUTHORIZED'));
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = { authenticate, deviceAuth, authorize };
