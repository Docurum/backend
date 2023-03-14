import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import { userController } from "@v1/controllers";

const router: Router = express.Router();

router.get("/get-user", authMiddleware, userController.getUser);

export default router;
