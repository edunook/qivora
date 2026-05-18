import { Router } from "express";
import {
  getMyResults,
  getResultById,
  publishResults
} from "../controllers/resultController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getMyResults);
router.get("/:resultId", protect, getResultById);
router.post("/publish/:examId", protect, authorize("teacher", "organization", "admin"), publishResults);

export default router;
