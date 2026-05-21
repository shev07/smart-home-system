const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const sensorService       = require('../services/sensor.service');

// POST /api/sensors/data — ESP32 push
const ingestData = asyncHandler(async (req, res) => {
  const data = await sensorService.ingestData(req.body);
  successResponse(res, data, 'Sensor data recorded', 201);
});

// GET /api/sensors/latest?deviceId=
const getLatest = asyncHandler(async (req, res) => {
  const data = await sensorService.getLatestByDevice(req.query.deviceId, req.user._id);
  successResponse(res, data, 'Latest sensor data retrieved');
});

// GET /api/sensors/history?sensorDeviceId=&limit=&page=
const getHistory = asyncHandler(async (req, res) => {
  const { sensorDeviceId, limit, page } = req.query;
  const data = await sensorService.getHistory(sensorDeviceId, { limit, page });
  successResponse(res, data, 'Sensor history retrieved');
});

// GET /api/sensors/devices?deviceId=
const getSensorDevices = asyncHandler(async (req, res) => {
  const data = await sensorService.getSensorDevicesByDevice(req.query.deviceId);
  successResponse(res, data, 'Sensor devices retrieved');
});

// PATCH /api/sensors/devices/:id/status
const updateSensorDeviceStatus = asyncHandler(async (req, res) => {
  const data = await sensorService.updateSensorDeviceStatus(req.params.id, req.body);
  successResponse(res, data, 'Sensor device status updated');
});

module.exports = { ingestData, getLatest, getHistory, getSensorDevices, updateSensorDeviceStatus };
