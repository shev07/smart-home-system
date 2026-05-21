const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const homeService         = require('../services/home.service');

// ── Home handlers ────────────────────────────────────────────────

const createHome = asyncHandler(async (req, res) => {
  const home = await homeService.createHome(req.user._id, req.body);
  successResponse(res, home, 'Home created', 201);
});

const getUserHomes = asyncHandler(async (req, res) => {
  const homes = await homeService.getUserHomes(req.user._id);
  successResponse(res, homes, 'Homes retrieved');
});

const getHomeById = asyncHandler(async (req, res) => {
  const home = await homeService.getHomeById(req.params.homeId, req.user._id);
  successResponse(res, home, 'Home retrieved');
});

// ── Area handlers ────────────────────────────────────────────────

const createArea = asyncHandler(async (req, res) => {
  const area = await homeService.createArea(req.params.homeId, req.user._id, req.body);
  successResponse(res, area, 'Area created', 201);
});

const getAreasByHome = asyncHandler(async (req, res) => {
  const areas = await homeService.getAreasByHome(req.params.homeId, req.user._id);
  successResponse(res, areas, 'Areas retrieved');
});

const getAreaById = asyncHandler(async (req, res) => {
  const area = await homeService.getAreaById(req.params.areaId, req.params.homeId, req.user._id);
  successResponse(res, area, 'Area retrieved');
});

const updateArea = asyncHandler(async (req, res) => {
  const area = await homeService.updateArea(req.params.areaId, req.params.homeId, req.user._id, req.body);
  successResponse(res, area, 'Area updated');
});

const deleteArea = asyncHandler(async (req, res) => {
  const result = await homeService.deleteArea(req.params.areaId, req.params.homeId, req.user._id);
  successResponse(res, result, 'Area deleted');
});

module.exports = { createHome, getUserHomes, getHomeById, createArea, getAreasByHome, getAreaById, updateArea, deleteArea };
