import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import { consultationController } from "@v1/controllers";

const router: Router = express.Router();

router.post("/schedule-event", authMiddleware, consultationController.scheduleEvent);

export default router;
