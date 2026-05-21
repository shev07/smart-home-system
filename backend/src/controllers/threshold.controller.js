const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const thresholdService    = require('../services/threshold.service');

const createRule   = asyncHandler(async (req, res) => {
  const rule = await thresholdService.createRule(req.user._id, req.body);
  successResponse(res, rule, 'Threshold rule created', 201);
});

const getRules     = asyncHandler(async (req, res) => {
  const rules = await thresholdService.getRules(req.user._id, req.query);
  successResponse(res, rules, 'Threshold rules retrieved');
});

const getRuleById  = asyncHandler(async (req, res) => {
  const rule = await thresholdService.getRuleById(req.params.id, req.user._id);
  successResponse(res, rule, 'Threshold rule retrieved');
});

const updateRule   = asyncHandler(async (req, res) => {
  const rule = await thresholdService.updateRule(req.params.id, req.user._id, req.body);
  successResponse(res, rule, 'Threshold rule updated');
});

const toggleRule   = asyncHandler(async (req, res) => {
  const rule = await thresholdService.toggleRule(req.params.id, req.user._id);
  successResponse(res, rule, `Rule ${rule.isActive ? 'activated' : 'deactivated'}`);
});

const deleteRule   = asyncHandler(async (req, res) => {
  const result = await thresholdService.deleteRule(req.params.id, req.user._id);
  successResponse(res, result, 'Threshold rule deleted');
});

module.exports = { createRule, getRules, getRuleById, updateRule, toggleRule, deleteRule };
