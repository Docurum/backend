import express, { Router } from "express";
import { registerController } from "../controllers";

const router: Router = express.Router();

router.post("/register", registerController.register);

export default router;
