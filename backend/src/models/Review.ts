import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, required: true },
    status: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible"
    }
  },
  { timestamps: true }
);

reviewSchema.index({ exam: 1, author: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
