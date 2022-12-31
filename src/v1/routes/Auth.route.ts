import { registerController, usernameController } from "@v1/controllers";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/register", registerController.register);
router.post("/check-username", usernameController.exists);

export default router;
