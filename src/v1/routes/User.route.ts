import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import userController from "../controllers/user/User.controller";

const router: Router = express.Router();

router.post("/get-user", authMiddleware, userController.getUser);

export default router;
