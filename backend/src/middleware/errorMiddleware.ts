import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route not found", 404));
}

export function errorHandler(
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error"
  });
}
