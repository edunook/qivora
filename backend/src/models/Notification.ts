import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "exam_reminder",
        "result_alert",
        "violation_alert",
        "success",
        "error",
        "social"
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    readAt: { type: Date }
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
