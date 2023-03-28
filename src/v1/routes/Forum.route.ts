import { topicController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/create-topic", authMiddleware, topicController.createTopic);
router.post("/create-category", authMiddleware, topicController.createCategory);
router.get("/get-categories", authMiddleware, topicController.getCategories);
router.get("/search-categories", authMiddleware, topicController.searchCategoriesByName);

export default router;
