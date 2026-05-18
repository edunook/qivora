import { Router } from "express";
import {
  deleteExam,
  deleteUser,
  getAdminDashboard,
  listExamsAdmin,
  listUsers,
  suspendUser
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/dashboard", getAdminDashboard);
router.get("/users", listUsers);
router.get("/exams", listExamsAdmin);
router.patch("/users/:userId/suspend", suspendUser);
router.delete("/users/:userId", deleteUser);
router.delete("/exams/:examId", deleteExam);

export default router;
