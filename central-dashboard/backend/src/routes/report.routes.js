import express from "express";

import {
  downloadReport,
  reportsList,
  reportsSummary,
  viewReport,
} from "../controllers/report.controller.js";

const router =
  express.Router();

router.get(
  "/summary",
  reportsSummary
);

router.get(
  "/list",
  reportsList
);

router.get(
  "/view/:reportId",
  viewReport
);

router.get(
  "/download/:reportId",
  downloadReport
);

export default router;
