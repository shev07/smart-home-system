const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Thành viên được admin thêm vào — có quyền quản lý device/area bên trong
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

homeSchema.index({ ownerIds: 1 });
homeSchema.index({ memberIds: 1 });

module.exports = mongoose.model("Home", homeSchema);