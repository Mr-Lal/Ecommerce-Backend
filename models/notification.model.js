// models/notification.model.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "system", "other"],
      default: "order",
    },
    isSeen: { type: Boolean, default: false },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // Optional
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
