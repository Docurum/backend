import { topicController } from "@v1/controllers";

import express, { Router } from "express";

const router: Router = express.Router();

router.post("/create-topic", topicController.register);

export default router;
