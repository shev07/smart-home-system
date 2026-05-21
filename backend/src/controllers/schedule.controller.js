const asyncHandler        = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const scheduleService     = require('../services/schedule.service');

const createSchedule  = asyncHandler(async (req, res) => {
  const s = await scheduleService.createSchedule(req.user._id, req.body);
  successResponse(res, s, 'Schedule created', 201);
});

const getSchedules    = asyncHandler(async (req, res) => {
  const schedules = await scheduleService.getSchedules(req.user._id);
  successResponse(res, schedules, 'Schedules retrieved');
});

const getScheduleById = asyncHandler(async (req, res) => {
  const s = await scheduleService.getScheduleById(req.params.id, req.user._id);
  successResponse(res, s, 'Schedule retrieved');
});

const updateSchedule  = asyncHandler(async (req, res) => {
  const s = await scheduleService.updateSchedule(req.params.id, req.user._id, req.body);
  successResponse(res, s, 'Schedule updated');
});

const toggleSchedule  = asyncHandler(async (req, res) => {
  const s = await scheduleService.toggleSchedule(req.params.id, req.user._id);
  successResponse(res, s, `Schedule ${s.activeStatus ? 'activated' : 'deactivated'}`);
});

const deleteSchedule  = asyncHandler(async (req, res) => {
  const result = await scheduleService.deleteSchedule(req.params.id, req.user._id);
  successResponse(res, result, 'Schedule deleted');
});

module.exports = { createSchedule, getSchedules, getScheduleById, updateSchedule, toggleSchedule, deleteSchedule };
