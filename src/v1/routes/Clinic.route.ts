import { clinicController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/create-clinic", authMiddleware, clinicController.createClinic);
router.get("/get-clinics", authMiddleware, clinicController.getClinic);
router.delete("/delete-clinic/:id", authMiddleware, clinicController.deleteClinic);
router.put("/edit-clinic/:id", authMiddleware, clinicController.editClinic);
router.get("/get-clinic/:id", authMiddleware, clinicController.getClinicById);
router.get("/get-clinic-by-username/:username", clinicController.getClinicByUsername);
router.post('/verify-doctor', authMiddleware,clinicController.verifyDoctor);
 router.get('/applied-doctors', authMiddleware, clinicController.checkDoctorApplicationStatus);
router.get('/get-doctors', authMiddleware, clinicController.getCredencials);
router.put('/edit-doctor/:id', authMiddleware, clinicController.approveDoctorById);
export default router;
