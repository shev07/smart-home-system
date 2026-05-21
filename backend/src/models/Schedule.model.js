const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Hành động thực thi: bật hoặc tắt
    action: {
      type: String,
      required: true,
      enum: ["on", "off"],
      trim: true,
    },
    activeStatus: {
      type: Boolean,
      default: true,
    },
    startDay: {
      type: Date,
      required: true,
    },
    endDay: {
      type: Date,
      required: true,
    },
    // Định dạng "HH:MM" — giờ bắt đầu trong ngày
    startTime: {
      type: String,
      required: true,
    },
    // Định dạng "HH:MM" — giờ kết thúc trong ngày
    endTime: {
      type: String,
      required: true,
    },
    // Ngày trong tuần: 0=CN, 1=T2, ..., 6=T7
    scheduledDays: {
      type: [Number],
      default: [],
    },
    // Ngày ngoại lệ (bỏ qua những ngày này)
    exceptions: {
      type: [Date],
      default: [],
    },
    // Danh sách device áp dụng (FE tự expand từ area nếu cần)
    deviceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
      },
    ],
  },
  { timestamps: true }
);

scheduleSchema.index({ createdBy: 1, activeStatus: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);