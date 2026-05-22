const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  passwordHash: Joi.string().min(6).max(128).required(),
  phoneNumber: Joi.string().trim().pattern(/^[0-9+\-\s]{7,20}$/).allow('', null).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const recoveryVerifySchema = Joi.object({
  username: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{7,20}$/).required(),
});

const resetPasswordSchema = Joi.object({
  username: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{7,20}$/).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = { registerSchema, loginSchema, recoveryVerifySchema, resetPasswordSchema };
