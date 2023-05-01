import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import { consultationController } from "@v1/controllers";

const router: Router = express.Router();

/// https://www.docurum.com/payment/razorpay (for razorpay payments)
router.post("/create-payment-order", authMiddleware, consultationController.createPaymentOrder);
router.post("/schedule-event", authMiddleware, consultationController.scheduleEvent);
router.post("/payment-success", authMiddleware, consultationController.paymentSuccess);
router.get("/get-attendee-pending-consultations", authMiddleware, consultationController.getAttendeePendingConsultations);
router.get("/get-attendee-completed-consultations", authMiddleware, consultationController.getAttendeeCompletedConsultations);
router.post("/get-ai-chat-completion", authMiddleware, consultationController.getAiChatCompletion);

export default router;
