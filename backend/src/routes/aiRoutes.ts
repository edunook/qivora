import { Router } from "express";
import { askAssistant } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/assistant", protect, askAssistant);

export default router;
