const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const alertService        = require('../services/alert.service');

// GET /api/alerts?homeId=&isRead=&limit=&page=
const getAlerts    = asyncHandler(async (req, res) => {
  const data = await alertService.getAlerts(req.user._id, req.query);
  successResponse(res, data, 'Alerts retrieved');
});

// PATCH /api/alerts/:id/read
const markAsRead   = asyncHandler(async (req, res) => {
  const alert = await alertService.markAsRead(req.params.id);
  successResponse(res, alert, 'Alert marked as read');
});

// PATCH /api/alerts/read-all?homeId=
const markAllRead  = asyncHandler(async (req, res) => {
  const result = await alertService.markAllAsRead(req.user._id, req.query.homeId);
  successResponse(res, result, 'All alerts marked as read');
});

module.exports = { getAlerts, markAsRead, markAllRead };
