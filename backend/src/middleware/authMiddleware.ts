import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
    name: string;
    email: string;
  };
};

export async function protect(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; role: string };
    const user = await User.findById(decoded.sub).select("name email role isSuspended");

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (user.isSuspended) {
      return next(new AppError("User account is suspended", 403));
    }

    req.user = {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }

    next();
  };
}
