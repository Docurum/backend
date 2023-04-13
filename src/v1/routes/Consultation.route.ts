import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import { consultationController } from "@v1/controllers";

const router: Router = express.Router();

/// https://www.docurum.com/payment/razorpay (for razorpay payments)
router.post("/create-consultation", authMiddleware, consultationController.scheduleEvent);
router.post("/schedule-event", authMiddleware, consultationController.scheduleEvent);

export default router;
