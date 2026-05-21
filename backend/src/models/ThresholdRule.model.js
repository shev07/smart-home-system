const mongoose = require("mongoose");

const thresholdRuleSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Target device bị điều khiển hoặc theo dõi
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Loại rule:
    // ALERT_ONLY    — Chỉ gửi thông báo khi vượt ngưỡng, không điều khiển device
    // AUTO_CONTROL  — Tự động bật/tắt device + gửi thông báo khi vượt ngưỡng
    ruleType: {
      type: String,
      enum: ["ALERT_ONLY", "AUTO_CONTROL"],
      default: "AUTO_CONTROL",
      required: true,
    },
    // Loại dữ liệu sensor cần so sánh (VD: "temperature", "humidity")
    dataType: {
      type: String,
      required: true,
      trim: true,
    },
    thresholdValue: {
      type: Number,
      required: true,
    },
    thresholdUnit: {
      type: String,
      default: "",
    },
    alertValue: {
      type: Number,
      required: true,
    },
    alertUnit: {
      type: String,
      default: "",
    },
    // Hành động thực thi (chỉ dùng khi ruleType = AUTO_CONTROL)
    // VD: "on", "off"
    action: {
      type: String,
      trim: true,
      default: "",
    },
    // Số giây chờ giữa 2 lần trigger liên tiếp (chống spam alert)
    cooldownTime: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ThresholdRule", thresholdRuleSchema);