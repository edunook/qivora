import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);

export default router;
