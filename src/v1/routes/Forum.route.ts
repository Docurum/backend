import { topicController } from "@v1/controllers";
import { authMiddleware } from "@v1/middlewares";
import express, { Router } from "express";
import commentController from "../controllers/comment/Comment.controller";

const router: Router = express.Router();

// topic routes

// auth routes
router.post("/create-topic", authMiddleware, topicController.createTopic);
router.post("/search-topics", topicController.searchTopicsByNameAndDescription);
router.get("/upvote-topic/:id", authMiddleware, topicController.upvoteTopic);
router.get("/downvote-topic/:id", authMiddleware, topicController.downvoteTopic);

// open routes
router.get("/get-topic/:id", topicController.getTopicsById);
router.get("/get-topic-by-username/:username", topicController.getTopicByUsername);

// comment routes
router.post("/create-comment", authMiddleware, commentController.createComment);
router.get("/upvote-comment/:id", authMiddleware, commentController.upvoteComment);
router.get("/downvote-comment/:id", authMiddleware, commentController.downvoteComment);
router.get("/get-comments-by-topic/:id", authMiddleware, commentController.getCommentsByTopicId);

// category routes
router.post("/create-category", authMiddleware, topicController.createCategory);
router.post("/get-categories-by-id", authMiddleware, topicController.getCategories);
router.post("/search-categories-by-name", authMiddleware, topicController.searchCategoriesByName);
router.post("/is-category-present", authMiddleware, topicController.categoryExists);

export default router;
