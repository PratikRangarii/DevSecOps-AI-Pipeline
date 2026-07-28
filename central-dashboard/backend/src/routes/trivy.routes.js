import express from "express";
import { getTrivySummaryController } from "../controllers/trivy.controller.js";

const router = express.Router();

router.get("/summary", getTrivySummaryController);

export default router;
