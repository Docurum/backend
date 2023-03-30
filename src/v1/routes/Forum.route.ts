import { topicController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";

const router: Router = express.Router();

router.post("/create-topic", authMiddleware, topicController.createTopic);
router.post("/create-category", authMiddleware, topicController.createCategory);
router.post("/get-categories-by-id", authMiddleware, topicController.getCategories);
router.post("/search-categories-by-name", authMiddleware, topicController.searchCategoriesByName);
router.post("/search-topics", topicController.searchTopicsByNameAndDescription);
router.get("/get-topic/:id", topicController.getTopicsById);
router.post("/is-category-present", authMiddleware, topicController.categoryExists);

export default router;
