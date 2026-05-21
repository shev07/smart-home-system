const ThresholdRule = require('../models/ThresholdRule.model');
const Schedule      = require('../models/Schedule.model');
const Device        = require('../models/Device.model');
const CommandQueue  = require('../models/CommandQueue.model');
const Alert         = require('../models/Alert.model');
const AppError      = require('../utils/AppError');
const socketService = require('./socket.service');
const { WS_EVENTS, COMMAND_STATUS, COMMAND_SOURCE, RULE_TYPE } = require('../config/constants');

/**
 * Đánh giá ThresholdRules khi nhận sensor data mới từ ESP32
 * Gọi sau mỗi lần ingestData()
 *
 * @param {object} sensorData   - Mongoose document SensorData { sensorDeviceId, value, unit }
 * @param {object} sensorDevice - Mongoose document SensorDevice { deviceId, sensorType }
 * @param {object} device       - Mongoose document Device { homeId }
 */
const evaluateThresholds = async (sensorData, sensorDevice, device) => {
  // Tải tất cả active rules có dataType khớp sensorType của sensor này
  const rules = await ThresholdRule.find({
    isActive: true,
    dataType: sensorDevice.sensorType,
  });

  if (!rules.length) return;

  const homeId = device.homeId.toString();

  for (const rule of rules) {
    // ── Cooldown check ──────────────────────────────────────────
    if (rule.cooldownTime > 0) {
      const lastAlert = await Alert.findOne({ ruleId: rule._id }).sort({ timestamp: -1 }).lean();
      if (lastAlert) {
        const secondsSinceLastAlert = (Date.now() - new Date(lastAlert.timestamp).getTime()) / 1000;
        if (secondsSinceLastAlert < rule.cooldownTime) continue; // Còn trong cooldown, bỏ qua
      }
    }

    // ── Threshold check ─────────────────────────────────────────
    if (sensorData.value <= rule.thresholdValue) continue; // Không vượt ngưỡng

    // ── Tạo Alert ───────────────────────────────────────────────
    const alertContent = `[${rule.name}] ${sensorDevice.sensorType} = ${sensorData.value}${sensorData.unit} vượt ngưỡng ${rule.thresholdValue}${rule.thresholdUnit}`;

    const alert = await Alert.create({
      ruleId:        rule._id,
      deviceId:      rule.deviceId,
      sensorDeviceId: sensorDevice._id,
      alertContent,
      timestamp:     new Date(),
      isRead:        false,
    });

    // Emit alert lên FE qua WebSocket
    socketService.emitToHome(homeId, WS_EVENTS.ALERT_NEW, {
      alertId:      alert._id,
      ruleId:       rule._id,
      deviceId:     rule.deviceId,
      alertContent,
      timestamp:    alert.timestamp,
    });

    // ── AUTO_CONTROL: Tạo CommandQueue để điều khiển device ────
    if (rule.ruleType === RULE_TYPE.AUTO_CONTROL && rule.action) {
      const expiresAt = new Date(Date.now() + 60 * 1000); // 60s TTL
      await CommandQueue.create({
        deviceId:  rule.deviceId,
        action:    rule.action,
        status:    COMMAND_STATUS.PENDING,
        source:    COMMAND_SOURCE.THRESHOLD,
        expiresAt,
      });
    }
  }
};

/**
 * Thực thi tất cả Schedules đang active và phù hợp với thời điểm hiện tại
 * Gọi bởi cron job mỗi phút trong app.js
 */
const executeActiveSchedules = async () => {
  const now   = new Date();
  const today = now.getDay();      // 0=CN, 1=T2...6=T7
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const schedules = await Schedule.find({
    activeStatus: true,
    startDay: { $lte: now },
    endDay:   { $gte: now },
    scheduledDays: { $in: [today] },
  }).lean();

  for (const schedule of schedules) {
    // ── Exception check: bỏ qua ngày ngoại lệ ─────────────────
    const isException = schedule.exceptions.some((exDate) => {
      const ex = new Date(exDate);
      return ex.getFullYear() === now.getFullYear() &&
             ex.getMonth()    === now.getMonth()    &&
             ex.getDate()     === now.getDate();
    });
    if (isException) continue;

    // ── Time window check ───────────────────────────────────────
    if (currentTime < schedule.startTime || currentTime > schedule.endTime) continue;

    // ── Thực thi: update devices + tạo CommandQueue ─────────────
    const targetDeviceIds = schedule.deviceIds;
    if (!targetDeviceIds.length) continue;

    // Cập nhật status DB trực tiếp (batch)
    await Device.updateMany(
      { _id: { $in: targetDeviceIds } },
      { status: schedule.action }
    );

    // Tạo CommandQueue để ESP32 nhận lệnh thực tế
    const expiresAt = new Date(Date.now() + 60 * 1000);
    const commands = targetDeviceIds.map((deviceId) => ({
      deviceId,
      action:   schedule.action,
      status:   COMMAND_STATUS.PENDING,
      source:   COMMAND_SOURCE.SCHEDULE,
      expiresAt,
    }));
    await CommandQueue.insertMany(commands);

    // Lấy homeId từ device đầu tiên để emit socket
    const firstDevice = await Device.findById(targetDeviceIds[0]).select('homeId').lean();
    if (firstDevice) {
      socketService.emitToHome(firstDevice.homeId.toString(), WS_EVENTS.SCHEDULE_EXECUTED, {
        scheduleId: schedule._id,
        deviceIds:  targetDeviceIds,
        action:     schedule.action,
        timestamp:  now,
      });
    }
  }
};

module.exports = { evaluateThresholds, executeActiveSchedules };
