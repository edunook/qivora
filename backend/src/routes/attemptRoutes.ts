import { Router } from "express";
import {
  getAttempt,
  logViolation,
  saveAttempt,
  startAttempt,
  submitAttempt
} from "../controllers/attemptController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import {
  saveAttemptSchema,
  submitAttemptSchema,
  violationSchema
} from "../validators/attemptValidators.js";

const router = Router();

router.use(protect, authorize("student", "admin"));
router.post("/:examId/start", startAttempt);
router.get("/:examId", getAttempt);
router.put("/:examId/save", validateBody(saveAttemptSchema), saveAttempt);
router.post("/:examId/submit", validateBody(submitAttemptSchema), submitAttempt);
router.post("/:examId/violations", validateBody(violationSchema), logViolation);

export default router;
