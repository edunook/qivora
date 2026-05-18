import mongoose, { InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true, lowercase: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["student", "teacher", "admin", "organization"],
      default: "student"
    },
    avatar: {
      type: String,
      default: "https://api.dicebear.com/9.x/thumbs/svg?seed=qivora"
    },
    bio: { type: String, default: "" },
    organizationName: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isSuspended: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpiresAt: { type: Date },
    lastSeenAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDocument = mongoose.HydratedDocument<InferSchemaType<typeof userSchema>> & {
  comparePassword: (candidate: string) => Promise<boolean>;
};

export const User = mongoose.model("User", userSchema);
