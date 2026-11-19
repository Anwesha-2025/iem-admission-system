
import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = Router();

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message: {
    message: "Too many attempts. Please try again later."
  }
});

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", resetLimiter, forgotPassword);
router.post("/reset-password", resetLimiter, resetPassword);

router.post("/verify-email", resetLimiter, verifyEmail);
router.post("/resend-verification", resetLimiter, resendVerification);

router.get("/me", protect, me);

export default router;
