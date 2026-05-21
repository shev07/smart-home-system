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
    user: { id: user._id, name: user.name, email: user.email },
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
    user: { id: user._id, name: user.name, email: user.email },
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

module.exports = { register, login, getMe };
