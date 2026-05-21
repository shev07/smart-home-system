const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    // ID vật lý từ ESP32 (VD: "esp32-01") — dùng để auto-discover thiết bị mới
    externalId: {
      type: String,
      trim: true,
      sparse: true, // unique nhưng cho phép null
      unique: true,
      index: true,
    },
    // null nếu là thiết bị mới chưa được gán vào home nào
    homeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      default: null,
      index: true,
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type:{
        type: String,
        required: true,
        enum: ['light', 'fan'],
    },
    status: {
        type: String,
        enum: ['on', 'off', 'disconnected'],
        default: 'off',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);