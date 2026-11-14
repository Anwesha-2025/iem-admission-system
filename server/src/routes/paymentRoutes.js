import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { pay, getMyPayment } from "../controllers/paymentController.js";
const router = Router();
router.use(protect);
router.post("/pay", pay);
router.get("/mine", getMyPayment);
export default router;
