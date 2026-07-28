import express from "express";
import { getJenkinsSummary, getJenkinsBuilds } from "../controllers/jenkins.controller.js";

const router = express.Router();

router.get("/summary", getJenkinsSummary);

router.get("/builds", getJenkinsBuilds);


export default router;
