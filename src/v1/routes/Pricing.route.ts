import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import { pricingController } from "@v1/controllers";

const router: Router = express.Router();

router.post("/create-pricing", authMiddleware, pricingController.createPricing);
router.get("/get-pricing", authMiddleware, pricingController.getPricing);
router.put("/edit-pricing/:id", authMiddleware, pricingController.editPricing);
router.delete("/delete-pricing/:id", authMiddleware, pricingController.deletePricing);

// open route
router.get("/get-pricing-username/:username", pricingController.getPricingByUsername);

export default router;
