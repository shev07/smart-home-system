const User     = require('../models/User.model');
const Home     = require('../models/Home.model');
const Device   = require('../models/Device.model');
const AppError = require('../utils/AppError');

/**
 * Lấy danh sách tất cả users (admin only)
 */
const getAllUsers = async ({ page = 1, limit = 20, role } = {}) => {
  const filter = {};
  if (role) filter.role = role;

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

/**
 * Thay đổi role của user (admin only)
 * Admin không thể tự hạ cấp chính mình
 */
const changeUserRole = async (targetUserId, newRole, requestingAdminId) => {
  if (targetUserId.toString() === requestingAdminId.toString()) {
    throw new AppError('You cannot change your own role', 400, 'SELF_ROLE_CHANGE');
  }

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { role: newRole },
    { new: true, runValidators: true }
  ).select('-passwordHash -__v');

  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * Lấy danh sách tất cả homes (admin only)
 */
const getAllHomes = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const [homes, total] = await Promise.all([
    Home.find()
      .populate('ownerIds', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Home.countDocuments(),
  ]);

  return { homes, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

/**
 * Admin tạo home mới — có thể chọn owner tùy ý
 */
const adminCreateHome = async ({ name, ownerUserId }) => {
  // Verify user tồn tại
  const owner = await User.findById(ownerUserId);
  if (!owner) throw new AppError('Owner user not found', 404);

  const home = await Home.create({ name, ownerIds: [ownerUserId] });
  return home;
};

/**
 * Admin thêm user vào home (memberIds hoặc ownerIds)
 */
const addUserToHome = async (homeId, userId, asOwner = false) => {
  const home = await Home.findById(homeId);
  if (!home) throw new AppError('Home not found', 404);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const field = asOwner ? 'ownerIds' : 'memberIds';

  // Tránh duplicate
  if (home[field] && home[field].some((id) => id.toString() === userId.toString())) {
    throw new AppError('User is already in this home', 409);
  }

  home[field] = [...(home[field] || []), userId];
  await home.save();

  return home.populate('ownerIds', 'name email');
};

/**
 * Admin xóa user khỏi home
 */
const removeUserFromHome = async (homeId, userId) => {
  const home = await Home.findById(homeId);
  if (!home) throw new AppError('Home not found', 404);

  home.ownerIds  = home.ownerIds.filter((id) => id.toString() !== userId.toString());
  if (home.memberIds) {
    home.memberIds = home.memberIds.filter((id) => id.toString() !== userId.toString());
  }

  if (home.ownerIds.length === 0) {
    throw new AppError('Cannot remove the last owner of a home', 400, 'LAST_OWNER');
  }

  await home.save();
  return { message: 'User removed from home' };
};

/**
 * Lấy danh sách tất cả devices (admin overview)
 */
const getAllDevices = async ({ page = 1, limit = 20, homeId } = {}) => {
  const filter = {};
  if (homeId) filter.homeId = homeId;

  const skip = (Number(page) - 1) * Number(limit);

  const [devices, total] = await Promise.all([
    Device.find(filter)
      .populate('homeId', 'name')
      .populate('areaId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Device.countDocuments(filter),
  ]);

  return { devices, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

/**
 * Lấy danh sách devices chưa được gán vào home nào (auto-discovered)
 */
const getUnassignedDevices = async () => {
  return Device.find({ homeId: null }).sort({ createdAt: -1 }).lean();
};

/**
 * Admin gán device (vừa được ESP32 tự tạo) vào 1 home
 */
const assignDeviceToHome = async (deviceId, homeId, areaId) => {
  const device = await Device.findById(deviceId);
  if (!device) throw new AppError('Device not found', 404);

  const home = await Home.findById(homeId);
  if (!home) throw new AppError('Home not found', 404);

  device.homeId = homeId;
  if (areaId) device.areaId = areaId;
  await device.save();
  return device;
};

module.exports = { getAllUsers, changeUserRole, getAllHomes, adminCreateHome, addUserToHome, removeUserFromHome, getAllDevices, getUnassignedDevices, assignDeviceToHome };

