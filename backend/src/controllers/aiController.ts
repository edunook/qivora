import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { askAi } from "../services/aiService.js";

export const askAssistant = asyncHandler(async (req: Request, res: Response) => {
  const reply = await askAi(
    req.body.provider,
    req.body.prompt,
    req.body.context || "No additional context supplied."
  );

  res.json({ success: true, reply });
});
