const ThresholdRule = require('../models/ThresholdRule.model');
const Home          = require('../models/Home.model');
const Device        = require('../models/Device.model');
const AppError      = require('../utils/AppError');

const _verifyDeviceOwnership = async (deviceId, userId) => {
  const device = await Device.findById(deviceId);
  if (!device) throw new AppError('Device not found', 404);
  const home = await Home.findOne({
    _id: device.homeId,
    $or: [{ ownerIds: userId }, { memberIds: userId }],
  });
  if (!home) throw new AppError('Access denied', 403);
  return { device, home };
};

const _verifyRuleOwnership = async (ruleId, userId) => {
  const rule = await ThresholdRule.findById(ruleId);
  if (!rule) throw new AppError('Threshold rule not found', 404);
  if (rule.createdBy.toString() !== userId.toString())
    throw new AppError('Access denied', 403);
  return rule;
};

const createRule = async (userId, payload) => {
  await _verifyDeviceOwnership(payload.deviceId, userId);
  const rule = await ThresholdRule.create({ ...payload, createdBy: userId });
  return rule;
};

const getRules = async (userId, { deviceId } = {}) => {
  const filter = { createdBy: userId };
  if (deviceId) filter.deviceId = deviceId;
  return ThresholdRule.find(filter).sort({ createdAt: -1 }).lean();
};

const getRuleById = async (ruleId, userId) => _verifyRuleOwnership(ruleId, userId);

const updateRule = async (ruleId, userId, updates) => {
  await _verifyRuleOwnership(ruleId, userId);
  const rule = await ThresholdRule.findByIdAndUpdate(ruleId, updates, { new: true, runValidators: true });
  return rule;
};

const toggleRule = async (ruleId, userId) => {
  const rule = await _verifyRuleOwnership(ruleId, userId);
  rule.isActive = !rule.isActive;
  await rule.save();
  return rule;
};

const deleteRule = async (ruleId, userId) => {
  const rule = await _verifyRuleOwnership(ruleId, userId);
  await rule.deleteOne();
  return { message: 'Threshold rule deleted' };
};

module.exports = { createRule, getRules, getRuleById, updateRule, toggleRule, deleteRule };
