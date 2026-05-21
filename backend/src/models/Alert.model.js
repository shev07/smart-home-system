const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThresholdRule",
      required: true,
      index: true,
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    sensorDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorDevice",
      default: null,
      index: true,
    },
    alertContent: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Alert", alertSchema);