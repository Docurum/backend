import { emailController, passwordController, registerController, usernameController } from "@v1/controllers";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/register", registerController.register);
router.post("/check-username", usernameController.exists);
router.get("/email-confirm/:token", emailController.verifyMail);
router.post("/forgot-password", emailController.sendForgotPasswordMail);
router.get("/reset-password/:token", passwordController.tokenExists);
router.post("/reset-password", passwordController.reset);

export default router;
