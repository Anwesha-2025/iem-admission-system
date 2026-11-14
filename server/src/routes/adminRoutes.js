import { Router } from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { listApplications, getApplication, reviewApplication } from "../controllers/adminController.js";
const router = Router();
router.use(protect, adminOnly);
router.get("/applications", listApplications);
router.get("/applications/:id", getApplication);
router.patch("/applications/:id/review", reviewApplication);
export default router;
