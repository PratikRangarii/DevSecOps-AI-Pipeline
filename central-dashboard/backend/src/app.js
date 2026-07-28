import sonarqubeRoutes from "./routes/sonarqube.routes.js";
import jenkinsRoutes from "./routes/jenkins.routes.js";
import trivyRoutes from "./routes/trivy.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import deploymentRoutes from "./routes/deployment.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import reportRoutes from "./routes/report.routes.js";

import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Wanderlust AI DevSecOps Dashboard API",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Central Dashboard Backend",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/jenkins", jenkinsRoutes);

app.use("/api/sonarqube", sonarqubeRoutes);

app.use("/api/trivy", trivyRoutes);

/* ---------- AI (Gemini Reports) ---------- */

app.use("/api/ai", aiRoutes);


app.use("/api/deployments", deploymentRoutes);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

export default app;
