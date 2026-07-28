import express from "express";
import { getSonarSummary } from "../controllers/sonarqube.controller.js";

const router = express.Router();

router.get("/summary", getSonarSummary);

export default router;
