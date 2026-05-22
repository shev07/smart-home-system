const Alert    = require('../models/Alert.model');
const Home     = require('../models/Home.model');
const Device   = require('../models/Device.model');
const AppError = require('../utils/AppError');
const { DEFAULT_ALERT_LIMIT } = require('../config/constants');

/**
 * Lấy alerts thuộc home của user (paginated)
 * Filter: isRead, limit, page
 */
const getAlerts = async (userId, { homeId, isRead, limit, page } = {}) => {
  // Verify home ownership
  const home = await Home.findOne({
    _id: homeId,
    $or: [{ ownerIds: userId }, { memberIds: userId }],
  });
  if (!home) throw new AppError('Home not found or access denied', 404);

  // Lấy tất cả deviceIds thuộc home này
  const devices = await Device.find({ homeId }).select('_id').lean();
  const deviceIds = devices.map((d) => d._id);

  const filter = { deviceId: { $in: deviceIds } };
  if (isRead !== undefined && isRead !== '') filter.isRead = isRead === 'true';

  const pageSize = Number(limit) || DEFAULT_ALERT_LIMIT;
  const pageNum  = Number(page)  || 1;
  const skip     = (pageNum - 1) * pageSize;

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate('ruleId', 'name ruleType')
      .populate('deviceId', 'name type')
      .lean(),
    Alert.countDocuments(filter),
  ]);

  return { alerts, total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) };
};

const markAsRead = async (alertId) => {
  const alert = await Alert.findByIdAndUpdate(alertId, { isRead: true }, { new: true });
  if (!alert) throw new AppError('Alert not found', 404);
  return alert;
};

const markAllAsRead = async (userId, homeId) => {
  const home = await Home.findOne({
    _id: homeId,
    $or: [{ ownerIds: userId }, { memberIds: userId }],
  });
  if (!home) throw new AppError('Access denied', 403);

  const devices = await Device.find({ homeId }).select('_id').lean();
  const deviceIds = devices.map((d) => d._id);

  const result = await Alert.updateMany(
    { deviceId: { $in: deviceIds }, isRead: false },
    { isRead: true }
  );
  return { modifiedCount: result.modifiedCount };
};

module.exports = { getAlerts, markAsRead, markAllAsRead };
