import jwt from "jsonwebtoken";
import { Response } from "express";
import { env, isProduction } from "../config/env.js";

export function signAccessToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL as any });
}

export function signRefreshToken(payload: { sub: string; role: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL as any });
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie("qivora_refresh_token", token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie("qivora_refresh_token", {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
}
