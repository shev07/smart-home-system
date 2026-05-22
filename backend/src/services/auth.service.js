const jwt    = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User   = require('../models/User.model');
const AppError = require('../utils/AppError');
const { JWT_EXPIRY } = require('../config/constants');

/**
 * Tạo JWT token cho user
 */
const _generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

const _normalizePhone = (value = '') => value.replace(/[\s-]/g, '').trim();

const _findUserForRecovery = async ({ username, phone }) => {
  const identifier = username?.trim();
  const normalizedPhone = _normalizePhone(phone);

  if (!identifier || !normalizedPhone) {
    throw new AppError('Username and phone number are required', 400, 'RECOVERY_FIELDS_REQUIRED');
  }

  const candidates = await User.find({
    $or: [
      { email: identifier.toLowerCase() },
      { name: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    ],
  });

  const user = candidates.find((item) => _normalizePhone(item.phoneNumber || '') === normalizedPhone);
  if (!user) {
    throw new AppError('Username and phone number do not match any account', 404, 'RECOVERY_ACCOUNT_NOT_FOUND');
  }

  return user;
};

/**
 * Đăng ký người dùng mới
 * @param {{ name, email, passwordHash, phoneNumber }} payload
 */
const register = async ({ name, email, passwordHash, phoneNumber }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email is already in use', 409, 'EMAIL_EXISTS');

  const userData = { name, email, passwordHash };
  if (phoneNumber && phoneNumber.trim() !== '') {
    userData.phoneNumber = phoneNumber;
  }

  const user = new User(userData);
  await user.save();

  const token = _generateToken(user._id);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

/**
 * Đăng nhập và trả về JWT
 * @param {{ email, password }} payload
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = _generateToken(user._id);
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

/**
 * Lấy thông tin user hiện tại từ ID
 * @param {string} userId
 */
const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash -__v');
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const verifyRecoveryIdentity = async ({ username, phone }) => {
  const user = await _findUserForRecovery({ username, phone });

  return {
    recoveryId: user._id,
    username: user.email,
    email: user.email,
    message: 'Identity verified. You can set a new password now.',
  };
};

const resetPassword = async ({ username, phone, newPassword }) => {
  const user = await _findUserForRecovery({ username, phone });
  user.passwordHash = newPassword;
  await user.save();

  return { message: 'Password updated successfully. You can login with the new password now.' };
};

module.exports = { register, login, getMe, verifyRecoveryIdentity, resetPassword };
