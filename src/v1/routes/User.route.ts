import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import { userController } from "@v1/controllers";

const router: Router = express.Router();

router.get("/get-user", authMiddleware, userController.getUser);
router.put("/update-picture", authMiddleware, userController.updateProfilePicture);
router.put("/create-doctor", authMiddleware, userController.createDoctor);
router.get("/get-recommended-users", authMiddleware, userController.getRecommendedUsers);
router.get("/get-user-by-username/:username", userController.getUserByUsername);
router.put("/edit-user", authMiddleware, userController.editUser);

export default router;
