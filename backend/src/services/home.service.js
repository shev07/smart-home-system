const Home     = require('../models/Home.model');
const Area     = require('../models/Area.model');
const Device   = require('../models/Device.model');
const AppError = require('../utils/AppError');

/**
 * Tạo home mới với owner là người dùng hiện tại
 */
const createHome = async (userId, { name }) => {
  const home = await Home.create({ name, ownerIds: [userId] });
  return home;
};

/**
 * Lấy danh sách homes của user (cả owner lẫn member)
 */
const getUserHomes = async (userId) => {
  return Home.find({
    $or: [{ ownerIds: userId }, { memberIds: userId }],
  })
    .populate('ownerIds', 'name email role')
    .populate('memberIds', 'name email role')
    .sort({ createdAt: -1 });
};

/**
 * Lấy chi tiết 1 home — user có thể là owner hoặc member
 */
const getHomeById = async (homeId, userId) => {
  const home = await Home.findOne({
    _id: homeId,
    $or: [{ ownerIds: userId }, { memberIds: userId }],
  })
    .populate('ownerIds', 'name email role')
    .populate('memberIds', 'name email role');
  if (!home) throw new AppError('Home not found', 404);
  return home;
};

/**
 * Tạo area mới trong home
 */
const createArea = async (homeId, userId, { name, description }) => {
  await getHomeById(homeId, userId); // Verify ownership
  const area = await Area.create({ homeId, name, description });
  return area;
};

/**
 * Lấy danh sách areas trong home, kèm số lượng device
 */
const getAreasByHome = async (homeId, userId) => {
  await getHomeById(homeId, userId); // Verify ownership

  const areas = await Area.find({ homeId }).sort({ createdAt: 1 }).lean();

  // Đếm device trong từng area
  const areaIds = areas.map((a) => a._id);
  const deviceCounts = await Device.aggregate([
    { $match: { areaId: { $in: areaIds } } },
    { $group: { _id: '$areaId', count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(deviceCounts.map((d) => [d._id.toString(), d.count]));

  return areas.map((area) => ({
    ...area,
    deviceCount: countMap[area._id.toString()] || 0,
  }));
};

/**
 * Lấy chi tiết 1 area kèm danh sách devices bên trong
 */
const getAreaById = async (areaId, homeId, userId) => {
  await getHomeById(homeId, userId); // Verify ownership
  const area = await Area.findOne({ _id: areaId, homeId });
  if (!area) throw new AppError('Area not found', 404);

  const devices = await Device.find({ areaId }).select('-__v').lean();
  return { ...area.toObject(), devices };
};

/**
 * Cập nhật area
 */
const updateArea = async (areaId, homeId, userId, updates) => {
  await getHomeById(homeId, userId);
  const area = await Area.findOneAndUpdate(
    { _id: areaId, homeId },
    updates,
    { new: true, runValidators: true }
  );
  if (!area) throw new AppError('Area not found', 404);
  return area;
};

/**
 * Xóa area — unassign devices khỏi area trước khi xóa
 */
const deleteArea = async (areaId, homeId, userId) => {
  await getHomeById(homeId, userId);
  const area = await Area.findOne({ _id: areaId, homeId });
  if (!area) throw new AppError('Area not found', 404);

  // Unassign tất cả devices thuộc area này
  await Device.updateMany({ areaId }, { areaId: null });
  await area.deleteOne();
  return { message: 'Area deleted' };
};

module.exports = { createHome, getUserHomes, getHomeById, createArea, getAreasByHome, getAreaById, updateArea, deleteArea };
