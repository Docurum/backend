import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import consultationController from "../controllers/consultation/Consultation.controller";

const router: Router = express.Router();

router.post("/schedule-event", authMiddleware, consultationController.scheduleEvent);

export default router;
