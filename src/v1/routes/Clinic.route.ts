import { clinicController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/create-clinic", authMiddleware, clinicController.createClinic);
router.get("/get-clinics", authMiddleware, clinicController.getClinic);
router.delete("/delete-clinic/:id", authMiddleware, clinicController.deleteClinic);
router.put("/edit-clinic/:id", authMiddleware, clinicController.editClinic);

export default router;
