const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const { SALT_ROUNDS } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true, // unique nhưng cho phép nhiều null
      unique: true,
    },
    // Vai trò người dùng
    // admin — Quản trị viên: xem/quản lý toàn bộ hệ thống
    // user  — Người dùng thường: chỉ quản lý home được gán vào
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: hash passwordHash trước khi lưu
 * Chỉ chạy khi passwordHash bị thay đổi (tránh double-hash)
 */
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
});

/**
 * So sánh plain password với passwordHash đã lưu
 * @param {string} candidatePassword - Mật khẩu từ request
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
