const Device       = require('../models/Device.model');
const CommandQueue = require('../models/CommandQueue.model');
const Home         = require('../models/Home.model');
const AppError     = require('../utils/AppError');
const socketService = require('./socket.service');
const { WS_EVENTS, COMMAND_TTL_SECONDS, COMMAND_STATUS, COMMAND_SOURCE } = require('../config/constants');

/**
 * Verify device thuộc home của user (authorization check)
 */
const _verifyOwnership = async (deviceId, userId) => {
  const device = await Device.findById(deviceId);
  if (!device) throw new AppError('Device not found', 404);

  const home = await Home.findOne({ _id: device.homeId, ownerIds: userId });
  if (!home) throw new AppError('Access denied', 403);

  return { device, home };
};

/**
 * Lấy danh sách devices theo homeId
 * Hỗ trợ filter: ?unassigned=true (chỉ lấy device chưa thuộc area nào)
 */
const getDevicesByHome = async (homeId, userId, { unassigned } = {}) => {
  const home = await Home.findOne({ _id: homeId, ownerIds: userId });
  if (!home) throw new AppError('Home not found', 404);

  const filter = { homeId };
  if (unassigned === 'true' || unassigned === true) filter.areaId = null;

  return Device.find(filter).select('-__v').sort({ createdAt: -1 }).lean();
};

/**
 * Thêm device mới vào home
 */
const addDevice = async (homeId, userId, { name, type, areaId }) => {
  const home = await Home.findOne({ _id: homeId, ownerIds: userId });
  if (!home) throw new AppError('Home not found', 404);

  const device = await Device.create({ homeId, name, type, areaId: areaId || null });
  return device;
};

/**
 * Lấy chi tiết 1 device
 */
const getDeviceById = async (deviceId, userId) => {
  const { device } = await _verifyOwnership(deviceId, userId);
  return device;
};

/**
 * Gán hoặc xóa device khỏi area
 * @param {string|null} areaId - null để unassign
 */
const updateDeviceArea = async (deviceId, userId, areaId) => {
  const { device } = await _verifyOwnership(deviceId, userId);
  device.areaId = areaId || null;
  await device.save();
  return device;
};

/**
 * Xóa device
 */
const deleteDevice = async (deviceId, userId) => {
  const { device } = await _verifyOwnership(deviceId, userId);
  await device.deleteOne();
  return { message: 'Device deleted' };
};

/**
 * Frontend gửi lệnh điều khiển device
 * Tạo CommandQueue entry — không update DB trực tiếp
 * ESP32 sẽ poll và thực thi lệnh này
 * @returns {{ commandId: string }} — FE lắng nghe ack qua WebSocket
 */
const controlDevice = async (deviceId, userId, action) => {
  const { device } = await _verifyOwnership(deviceId, userId);

  const expiresAt = new Date(Date.now() + COMMAND_TTL_SECONDS * 1000);
  const command = await CommandQueue.create({
    deviceId,
    action,
    status: COMMAND_STATUS.PENDING,
    source: COMMAND_SOURCE.MANUAL,
    requestedBy: userId,
    expiresAt,
  });

  return { commandId: command._id, message: 'Command queued — awaiting ESP32 execution' };
};

/**
 * ESP32 polling: lấy lệnh pending đầu tiên của device
 * Payload tối thiểu để giảm bandwidth trên constrained device
 */
const pollPendingCommand = async (deviceId) => {
  const command = await CommandQueue.findOneAndUpdate(
    { deviceId, status: COMMAND_STATUS.PENDING },
    { status: COMMAND_STATUS.SENT },
    { new: true, sort: { createdAt: 1 } }
  ).select('_id action deviceId');

  if (!command) return null;

  // Return minimal payload
  return { commandId: command._id, action: command.action, deviceId: command.deviceId };
};

/**
 * ESP32 xác nhận đã thực thi lệnh (hoặc thất bại)
 * Cập nhật DB và broadcast kết quả về Frontend qua WebSocket
 */
const acknowledgeCommand = async (commandId, { success, message }) => {
  const command = await CommandQueue.findById(commandId).populate('deviceId');
  if (!command) throw new AppError('Command not found', 404);

  const newStatus = success ? COMMAND_STATUS.EXECUTED : COMMAND_STATUS.FAILED;
  command.status          = newStatus;
  command.responseMessage = message || null;
  command.executedAt      = new Date();
  await command.save();

  const device = command.deviceId; // populated

  if (success) {
    // Cập nhật trạng thái device trong DB
    await Device.findByIdAndUpdate(device._id, { status: command.action });
  }

  // Lấy homeId để emit đúng room
  const home = await Home.findById(device.homeId);
  if (home) {
    socketService.emitToHome(home._id.toString(), WS_EVENTS.COMMAND_ACK, {
      commandId:   command._id,
      deviceId:    device._id,
      status:      newStatus,
      newStatus:   success ? command.action : device.status,
      message:     message || null,
    });
  }

  return { commandId, status: newStatus };
};

module.exports = {
  getDevicesByHome,
  addDevice,
  getDeviceById,
  updateDeviceArea,
  deleteDevice,
  controlDevice,
  pollPendingCommand,
  acknowledgeCommand,
};
