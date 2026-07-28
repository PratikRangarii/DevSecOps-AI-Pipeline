import api from "./api";

export const getAIReport = async () => {
  const response = await api.get("/api/ai/report");
  return response.data;
};

export const getAIHtmlReport = async () => {
  const response = await api.get("/api/ai/report/html");
  return response.data;
};
