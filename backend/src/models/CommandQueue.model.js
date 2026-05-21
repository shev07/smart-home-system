const mongoose = require("mongoose");

/**
 * CommandQueue — Hàng đợi lệnh điều khiển device
 *
 * Luồng hoạt động:
 * 1. Frontend gọi PATCH /api/devices/:id/status
 * 2. BE tạo CommandQueue entry (status: "pending")
 * 3. BE gửi lệnh đến ESP32 qua WebSocket / HTTP polling
 * 4. ESP32 xác nhận → BE cập nhật status thành "executed" hoặc "failed"
 * 5. BE broadcast kết quả về Frontend qua WebSocket
 */
const commandQueueSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    // Hành động cần thực thi trên device vật lý
    action: {
      type: String,
      required: true,
      enum: ["on", "off"],
    },
    // Trạng thái thực thi của lệnh
    // pending   — Đã tạo, chưa gửi đến ESP32
    // sent      — Đã gửi đến ESP32, chờ xác nhận
    // executed  — ESP32 đã thực thi thành công
    // failed    — ESP32 báo lỗi hoặc timeout
    status: {
      type: String,
      enum: ["pending", "sent", "executed", "failed"],
      default: "pending",
      index: true,
    },
    // Nguồn phát sinh lệnh
    // manual    — Người dùng thay đổi từ Frontend
    // schedule  — Triggered bởi Schedule cron job
    // threshold — Triggered bởi ThresholdRule automation
    source: {
      type: String,
      enum: ["manual", "schedule", "threshold"],
      default: "manual",
    },
    // Người yêu cầu (null nếu do hệ thống tự động trigger)
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Thời điểm lệnh hết hạn — nếu ESP32 chưa xác nhận trước thời điểm này
    // MongoDB TTL index sẽ tự xóa document sau khi expired
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL: tự xóa khi đến expiresAt
    },
    // Thông điệp phản hồi từ ESP32 (VD: "OK", "Device unreachable")
    responseMessage: {
      type: String,
      default: null,
    },
    // Thời điểm ESP32 xác nhận
    executedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index — query nhanh khi ESP32 polling lấy lệnh pending của device
commandQueueSchema.index({ deviceId: 1, status: 1 });

module.exports = mongoose.model("CommandQueue", commandQueueSchema);
