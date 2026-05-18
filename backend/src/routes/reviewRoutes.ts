import { Router } from "express";
import {
  createReview,
  listExamReviews,
  moderateReview
} from "../controllers/reviewController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { reviewSchema } from "../validators/reviewValidators.js";

const router = Router();

router.get("/:examId", listExamReviews);
router.post("/:examId", protect, authorize("student", "teacher", "organization", "admin"), validateBody(reviewSchema), createReview);
router.patch("/:reviewId/moderate", protect, authorize("admin"), moderateReview);

export default router;
