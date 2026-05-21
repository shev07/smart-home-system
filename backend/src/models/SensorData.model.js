const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema(
  {
    sensorDeviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorDevice",
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

sensorDataSchema.index({ sensorDeviceId: 1, timestamp: -1 });

module.exports = mongoose.model("SensorData", sensorDataSchema);