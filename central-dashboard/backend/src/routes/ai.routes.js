import express from "express";

import {
  getAIReport,
  getAIHtmlReport,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/report", getAIReport);
router.get("/report/html", getAIHtmlReport);

export default router;
