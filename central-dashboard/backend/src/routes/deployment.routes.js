import express from "express";

import { getDeployments } from "../controllers/deployment.controller.js";

const router = express.Router();

router.get("/summary", getDeployments);

export default router;
