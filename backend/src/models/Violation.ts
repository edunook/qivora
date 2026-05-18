import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    attempt: { type: mongoose.Schema.Types.ObjectId, ref: "Attempt", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["tab_switch", "window_blur", "fullscreen_exit", "copy", "paste", "right_click"],
      required: true
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    occurredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Violation = mongoose.model("Violation", violationSchema);
