import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { User, UserDocument } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import {
  clearRefreshCookie,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken
} from "../services/tokenService.js";
import { env } from "../config/env.js";
import { sendMail } from "../services/emailService.js";

function serializeUser(user: Awaited<ReturnType<typeof User.findById>> | any) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    organizationName: user.organizationName
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const existing = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username.toLowerCase() }]
  });

  if (existing) {
    throw new AppError("Email or username already exists", 409);
  }

  const user = await User.create({
    ...req.body,
    username: req.body.username.toLowerCase()
  });

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await User.updateOne(
    { _id: user._id },
    {
      $push: { refreshTokens: refreshToken },
      $set: { lastSeenAt: new Date() }
    }
  );

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    accessToken,
    user: serializeUser(user)
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = (await User.findOne({ email: req.body.email }).select("+password")) as UserDocument | null;
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const matched = await user.comparePassword(req.body.password);
  if (!matched) {
    throw new AppError("Invalid credentials", 401);
  }

  if (user.isSuspended) {
    throw new AppError("User account is suspended", 403);
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  await User.updateOne(
    { _id: user._id },
    {
      $push: { refreshTokens: refreshToken },
      $set: { lastSeenAt: new Date() }
    }
  );
  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    message: "Login successful",
    accessToken,
    user: serializeUser(user)
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.qivora_refresh_token as string | undefined;
  if (!refreshToken) {
    throw new AppError("Refresh token missing", 401);
  }

  const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string; role: string };
  const user = await User.findById(decoded.sub);

  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new AppError("Refresh token invalid", 401);
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const nextRefreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await User.updateOne(
    { _id: user._id },
    {
      $pull: { refreshTokens: refreshToken },
      $push: { refreshTokens: nextRefreshToken }
    }
  );
  setRefreshCookie(res, nextRefreshToken);

  res.json({
    success: true,
    accessToken,
    user: serializeUser(user)
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.qivora_refresh_token as string | undefined;
  if (refreshToken) {
    await User.updateOne(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } }
    );
  }

  clearRefreshCookie(res);
  res.json({ success: true, message: "Logged out successfully" });
});

export const me = asyncHandler(async (req: Request & { user?: { id: string } }, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ success: true, user: serializeUser(user) });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.json({ success: true, message: "If the email exists, a reset link has been sent." });
    return;
  }

  const rawToken = crypto.randomBytes(24).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  const resetLink = `${env.CLIENT_URL}/reset-password/${rawToken}`;
  await sendMail(
    user.email,
    "Reset your Qivora password",
    `<p>Reset your password by visiting <a href="${resetLink}">${resetLink}</a>.</p>`
  );

  res.json({ success: true, message: "If the email exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiresAt: { $gt: new Date() }
  }).select("+password");

  if (!user) {
    throw new AppError("Reset token is invalid or expired", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = "";
  user.resetPasswordExpiresAt = undefined;
  user.refreshTokens = [];
  await user.save();

  clearRefreshCookie(res);
  res.json({ success: true, message: "Password reset successful. Please log in again." });
});
