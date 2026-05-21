const Schedule = require('../models/Schedule.model');
const AppError = require('../utils/AppError');

const _verifyOwnership = async (scheduleId, userId) => {
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) throw new AppError('Schedule not found', 404);
  if (schedule.createdBy.toString() !== userId.toString())
    throw new AppError('Access denied', 403);
  return schedule;
};

const createSchedule = async (userId, payload) => {
  return Schedule.create({ ...payload, createdBy: userId });
};

const getSchedules = async (userId) => {
  return Schedule.find({ createdBy: userId }).sort({ createdAt: -1 }).lean();
};

const getScheduleById = async (scheduleId, userId) => _verifyOwnership(scheduleId, userId);

const updateSchedule = async (scheduleId, userId, updates) => {
  await _verifyOwnership(scheduleId, userId);
  return Schedule.findByIdAndUpdate(scheduleId, updates, { new: true, runValidators: true });
};

const toggleSchedule = async (scheduleId, userId) => {
  const schedule = await _verifyOwnership(scheduleId, userId);
  schedule.activeStatus = !schedule.activeStatus;
  await schedule.save();
  return schedule;
};

const deleteSchedule = async (scheduleId, userId) => {
  const schedule = await _verifyOwnership(scheduleId, userId);
  await schedule.deleteOne();
  return { message: 'Schedule deleted' };
};

module.exports = { createSchedule, getSchedules, getScheduleById, updateSchedule, toggleSchedule, deleteSchedule };
