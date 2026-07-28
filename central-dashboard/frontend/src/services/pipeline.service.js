import api from "./api";

export const getPipelineBuilds = (limit = 10) =>
  api.get(`/api/jenkins/builds?limit=${limit}`);
