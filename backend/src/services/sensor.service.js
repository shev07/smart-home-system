const SensorData    = require('../models/SensorData.model');
const SensorDevice  = require('../models/SensorDevice.model');
const Device        = require('../models/Device.model');
const Home          = require('../models/Home.model');
const AppError      = require('../utils/AppError');
const socketService = require('./socket.service');
const automationService = require('./automation.service');
const { WS_EVENTS, DEFAULT_SENSOR_HISTORY_LIMIT } = require('../config/constants');

/**
 * Định nghĩa các sensor type từ ESP32 payload
 * key = field name trong request body, value = metadata
 */
const SENSOR_TYPE_MAP = {
  temperature:  { unit: '°C',  name: 'Temperature' },
  humidity:     { unit: '%',   name: 'Humidity'    },
  anomalyScore: { unit: '',    name: 'Anomaly Score' },
  dataQuality:  { unit: '',    name: 'Data Quality'  },
};

/**
 * findOrCreate Device theo externalId (string ID của ESP32 như "esp32-01")
 * Nếu chưa có trong DB → tự động tạo mới với homeId = null (chưa gán nhà)
 */
const _findOrCreateDevice = async (externalId) => {
  let device = await Device.findOne({ externalId });
  if (!device) {
    device = await Device.create({
      externalId,
      name: externalId,           // Tên mặc định = externalId, admin có thể đổi sau
      type: 'light',
      homeId: null,               // Chưa gán vào home nào — admin sẽ assign sau
      status: 'on',
      isOnline: true,
    });
    console.log(`🆕 Auto-created Device: ${externalId}`);
  }
  return device;
};

/**
 * findOrCreate SensorDevice cho từng sensor type của device
 */
const _findOrCreateSensorDevice = async (deviceId, sensorType, meta) => {
  let sd = await SensorDevice.findOne({ deviceId, sensorType });
  if (!sd) {
    sd = await SensorDevice.create({
      deviceId,
      sensorType,
      name: meta.name,
      unit: meta.unit,
    });
    console.log(`🆕 Auto-created SensorDevice: ${sensorType} for device ${deviceId}`);
  }
  return sd;
};

/**
 * ESP32 ingest sensor data — chấp nhận format native của ESP32:
 * { deviceId: "esp32-01", temperature: 28.5, humidity: 65.3, anomalyScore: 0.28, dataQuality: 0.98 }
 *
 * Flow: findOrCreate Device → findOrCreate SensorDevices → lưu SensorData
 *       → emit WebSocket → trigger ThresholdRule automation
 */
const ingestData = async (payload) => {
  const { deviceId: externalId, ...readings } = payload;

  if (!externalId) throw new AppError('deviceId is required', 400);

  // 1. findOrCreate Device
  const device = await _findOrCreateDevice(externalId);

  const savedRecords = [];

  // 2. Xử lý từng sensor type có trong payload
  for (const [sensorType, meta] of Object.entries(SENSOR_TYPE_MAP)) {
    const value = readings[sensorType];
    if (value === undefined || value === null) continue; // Field không có trong payload → bỏ qua

    // findOrCreate SensorDevice cho sensor type này
    const sensorDevice = await _findOrCreateSensorDevice(device._id, sensorType, meta);

    // Lưu SensorData
    const sensorData = await SensorData.create({
      sensorDeviceId: sensorDevice._id,
      value: Number(value),
      unit: meta.unit,
    });

    savedRecords.push({ sensorType, value, unit: meta.unit, sensorDeviceId: sensorDevice._id });

    // 3. Emit WebSocket nếu device đã gán vào home
    if (device.homeId) {
      socketService.emitToHome(device.homeId.toString(), WS_EVENTS.SENSOR_DATA, {
        sensorDeviceId: sensorDevice._id,
        deviceId: device._id,
        externalId,
        sensorType,
        value,
        unit: meta.unit,
        timestamp: sensorData.createdAt,
      });

      // 4. Trigger ThresholdRule automation (non-blocking)
      automationService.evaluateThresholds(sensorData, sensorDevice, device).catch((err) =>
        console.error('⚠️ Automation evaluation error:', err.message)
      );
    }
  }

  return {
    deviceId: device._id,
    externalId,
    isNewDevice: !device.homeId, // Gợi ý FE biết đây là device mới chưa gán home
    records: savedRecords,
  };
};


/**
 * Lấy giá trị sensor mới nhất theo deviceId (cho Dashboard)
 * Trả về tất cả SensorDevices của device đó kèm giá trị mới nhất
 */
const getLatestByDevice = async (deviceId, userId) => {
  const home = await Home.findOne({ ownerIds: userId });
  if (!home) throw new AppError('Not authorized', 403);

  const sensorDevices = await SensorDevice.find({ deviceId }).lean();

  const results = await Promise.all(
    sensorDevices.map(async (sd) => {
      const latest = await SensorData.findOne({ sensorDeviceId: sd._id })
        .sort({ createdAt: -1 })
        .select('value unit createdAt')
        .lean();
      return { ...sd, latestData: latest || null };
    })
  );

  return results;
};

/**
 * Lịch sử sensor data (cho Recharts)
 * Paginated, sort mới nhất trước
 */
const getHistory = async (sensorDeviceId, { limit, page } = {}) => {
  const pageSize = Number(limit) || DEFAULT_SENSOR_HISTORY_LIMIT;
  const pageNum  = Number(page)  || 1;
  const skip     = (pageNum - 1) * pageSize;

  const [data, total] = await Promise.all([
    SensorData.find({ sensorDeviceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .select('value unit createdAt')
      .lean(),
    SensorData.countDocuments({ sensorDeviceId }),
  ]);

  return { data, total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) };
};

/**
 * Lấy tất cả SensorDevices của một Device
 */
const getSensorDevicesByDevice = async (deviceId) => {
  return SensorDevice.find({ deviceId }).select('-__v').lean();
};

/**
 * Cập nhật connectionStatus của SensorDevice
 */
const updateSensorDeviceStatus = async (sensorDeviceId, { connectionStatus, activeStatus }) => {
  const sd = await SensorDevice.findByIdAndUpdate(
    sensorDeviceId,
    { ...(connectionStatus !== undefined && { connectionStatus }), ...(activeStatus !== undefined && { activeStatus }) },
    { new: true, runValidators: true }
  );
  if (!sd) throw new AppError('SensorDevice not found', 404);
  return sd;
};

module.exports = { ingestData, getLatestByDevice, getHistory, getSensorDevicesByDevice, updateSensorDeviceStatus };
