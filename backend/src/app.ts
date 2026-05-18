import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { corsOptions } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

export const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Qivora API is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);
