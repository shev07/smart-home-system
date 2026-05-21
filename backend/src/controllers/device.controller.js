const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const deviceService       = require('../services/device.service');

// GET /api/devices?homeId=&unassigned=true
const getDevicesByHome = asyncHandler(async (req, res) => {
  const { homeId, unassigned } = req.query;
  const devices = await deviceService.getDevicesByHome(homeId, req.user._id, { unassigned });
  successResponse(res, devices, 'Devices retrieved');
});

// POST /api/devices
const addDevice = asyncHandler(async (req, res) => {
  const { homeId, name, type, areaId } = req.body;
  const device = await deviceService.addDevice(homeId, req.user._id, { name, type, areaId });
  successResponse(res, device, 'Device added', 201);
});

// GET /api/devices/:id
const getDeviceById = asyncHandler(async (req, res) => {
  const device = await deviceService.getDeviceById(req.params.id, req.user._id);
  successResponse(res, device, 'Device retrieved');
});

// PATCH /api/devices/:id/status  — Frontend điều khiển device → tạo CommandQueue
const controlDevice = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const result = await deviceService.controlDevice(req.params.id, req.user._id, action);
  successResponse(res, result, 'Command queued');
});

// PATCH /api/devices/:id/area  — Gán/xóa device khỏi area
const updateDeviceArea = asyncHandler(async (req, res) => {
  const { areaId } = req.body; // null để unassign
  const device = await deviceService.updateDeviceArea(req.params.id, req.user._id, areaId);
  successResponse(res, device, 'Device area updated');
});

// DELETE /api/devices/:id
const deleteDevice = asyncHandler(async (req, res) => {
  const result = await deviceService.deleteDevice(req.params.id, req.user._id);
  successResponse(res, result, 'Device deleted');
});

// GET /api/devices/command?deviceId= — ESP32 polls for pending command
const pollCommand = asyncHandler(async (req, res) => {
  const { deviceId } = req.query;
  const command = await deviceService.pollPendingCommand(deviceId);
  // Trả 204 nếu không có lệnh nào để ESP32 biết idle
  if (!command) return res.status(204).end();
  successResponse(res, command, 'Pending command');
});

// POST /api/devices/command/ack — ESP32 xác nhận thực thi
const acknowledgeCommand = asyncHandler(async (req, res) => {
  const { commandId, success, message } = req.body;
  const result = await deviceService.acknowledgeCommand(commandId, { success, message });
  successResponse(res, result, 'Command acknowledged');
});

module.exports = {
  getDevicesByHome, addDevice, getDeviceById, controlDevice,
  updateDeviceArea, deleteDevice, pollCommand, acknowledgeCommand,
};
