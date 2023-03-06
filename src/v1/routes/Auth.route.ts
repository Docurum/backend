import { emailController, loginController, passwordController, registerController, usernameController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/register", registerController.register);
router.post("/check-username", usernameController.exists);
router.get("/email-confirm/:token", emailController.verifyMail);
router.post("/forgot-password", emailController.sendForgotPasswordMail);
router.get("/reset-password/:token", passwordController.tokenExists);
router.post("/reset-password", passwordController.reset);
router.post("/login", loginController.login);
router.post("/refresh", authMiddleware, loginController.refresh);
router.post("/logout", authMiddleware, loginController.logout);

export default router;
