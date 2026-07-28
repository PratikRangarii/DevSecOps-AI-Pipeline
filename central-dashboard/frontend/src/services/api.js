import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const getBackendHealth = () =>
  api.get("/api/health");

export const getJenkinsSummary = () =>
  api.get("/api/jenkins/summary");

export const getSonarSummary = () =>
  api.get("/api/sonarqube/summary");

export const getTrivySummary = () =>
  api.get("/api/trivy/summary");

export default api;
