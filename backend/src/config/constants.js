/**
 * constants.js — Application-wide named constants
 * Không dùng số/string magic trực tiếp trong code business logic
 */

const SALT_ROUNDS = 12;
const JWT_EXPIRY = '7d';

// Số giây lệnh CommandQueue còn hiệu lực — nếu ESP32 chưa poll trong thời gian này thì expired
const COMMAND_TTL_SECONDS = 60;

// Số bản ghi sensor history mặc định mỗi page
const DEFAULT_SENSOR_HISTORY_LIMIT = 50;

// Số alerts mặc định mỗi page
const DEFAULT_ALERT_LIMIT = 20;

// Nguồn phát sinh lệnh CommandQueue
const COMMAND_SOURCE = Object.freeze({
  MANUAL: 'manual',
  SCHEDULE: 'schedule',
  THRESHOLD: 'threshold',
});

// Trạng thái CommandQueue
const COMMAND_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  EXECUTED: 'executed',
  FAILED: 'failed',
});

// Loại ThresholdRule
const RULE_TYPE = Object.freeze({
  ALERT_ONLY: 'ALERT_ONLY',
  AUTO_CONTROL: 'AUTO_CONTROL',
});

// WebSocket events
const WS_EVENTS = Object.freeze({
  SENSOR_DATA: 'sensor:data',
  DEVICE_STATUS: 'device:status',
  COMMAND_ACK: 'device:command:ack',
  ALERT_NEW: 'alert:new',
  SCHEDULE_EXECUTED: 'schedule:executed',
  SUBSCRIBE_HOME: 'subscribe:home',
});

module.exports = {
  SALT_ROUNDS,
  JWT_EXPIRY,
  COMMAND_TTL_SECONDS,
  DEFAULT_SENSOR_HISTORY_LIMIT,
  DEFAULT_ALERT_LIMIT,
  COMMAND_SOURCE,
  COMMAND_STATUS,
  RULE_TYPE,
  WS_EVENTS,
};
