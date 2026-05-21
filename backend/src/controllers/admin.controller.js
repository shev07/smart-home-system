const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const adminService        = require('../services/admin.service');

// GET /api/admin/users?page=&limit=&role=
const getAllUsers = asyncHandler(async (req, res) => {
  const data = await adminService.getAllUsers(req.query);
  successResponse(res, data, 'Users retrieved');
});

// PATCH /api/admin/users/:id/role  { role: 'admin' | 'user' }
const changeUserRole = asyncHandler(async (req, res) => {
  const user = await adminService.changeUserRole(req.params.id, req.body.role, req.user._id);
  successResponse(res, user, `User role updated to ${req.body.role}`);
});

// GET /api/admin/homes?page=&limit=
const getAllHomes = asyncHandler(async (req, res) => {
  const data = await adminService.getAllHomes(req.query);
  successResponse(res, data, 'Homes retrieved');
});

// POST /api/admin/homes  { name, ownerUserId }
const createHome = asyncHandler(async (req, res) => {
  const home = await adminService.adminCreateHome(req.body);
  successResponse(res, home, 'Home created', 201);
});

// POST /api/admin/homes/:homeId/users  { userId, asOwner? }
const addUserToHome = asyncHandler(async (req, res) => {
  const { userId, asOwner } = req.body;
  const home = await adminService.addUserToHome(req.params.homeId, userId, asOwner);
  successResponse(res, home, 'User added to home');
});

// DELETE /api/admin/homes/:homeId/users/:userId
const removeUserFromHome = asyncHandler(async (req, res) => {
  const result = await adminService.removeUserFromHome(req.params.homeId, req.params.userId);
  successResponse(res, result, 'User removed from home');
});

// GET /api/admin/devices?page=&limit=&homeId=
const getAllDevices = asyncHandler(async (req, res) => {
  const data = await adminService.getAllDevices(req.query);
  successResponse(res, data, 'Devices retrieved');
});

// GET /api/admin/devices/unassigned — devices mới từ ESP32 chưa gán home
const getUnassignedDevices = asyncHandler(async (req, res) => {
  const data = await adminService.getUnassignedDevices();
  successResponse(res, data, 'Unassigned devices retrieved');
});

// PATCH /api/admin/devices/:id/assign  { homeId, areaId? }
const assignDeviceToHome = asyncHandler(async (req, res) => {
  const { homeId, areaId } = req.body;
  const device = await adminService.assignDeviceToHome(req.params.id, homeId, areaId);
  successResponse(res, device, 'Device assigned to home');
});

module.exports = { getAllUsers, changeUserRole, getAllHomes, createHome, addUserToHome, removeUserFromHome, getAllDevices, getUnassignedDevices, assignDeviceToHome };
