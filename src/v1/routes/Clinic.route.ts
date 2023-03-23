import { clinicController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/create-clinic", authMiddleware, clinicController.createClinic);

export default router;
