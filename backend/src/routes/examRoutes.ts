import { Router } from "express";
import {
  createExam,
  followCreator,
  getCreatorProfile,
  getExamById,
  listExams
} from "../controllers/examController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { examSchema } from "../validators/examValidators.js";

const router = Router();

router.get("/", listExams);
router.get("/creator/:creatorId", getCreatorProfile);
router.get("/:examId", getExamById);
router.post("/", protect, authorize("teacher", "organization", "admin"), validateBody(examSchema), createExam);
router.post("/creator/:creatorId/follow", protect, followCreator);

export default router;
