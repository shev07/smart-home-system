const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const authService         = require('../services/auth.service');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  successResponse(res, result, 'Registration successful', 201);
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  successResponse(res, result, 'Login successful');
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  successResponse(res, user, 'User profile retrieved');
});

const verifyRecoveryIdentity = asyncHandler(async (req, res) => {
  const result = await authService.verifyRecoveryIdentity(req.body);
  successResponse(res, result, 'Recovery identity verified');
});

const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  successResponse(res, result, 'Password reset successful');
});

module.exports = { register, login, getMe, verifyRecoveryIdentity, resetPassword };
