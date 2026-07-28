const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:7000/api";

const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to fetch reports."
    );
  }

  return result.data;
};

export const getReportsSummary = async () => {
  const response = await fetch(
    `${API_BASE_URL}/reports/summary`
  );

  return handleResponse(response);
};

export const getReportsList = async () => {
  const response = await fetch(
    `${API_BASE_URL}/reports/list`
  );

  return handleResponse(response);
};

export const getReportViewUrl = (reportId) =>
  `${API_BASE_URL}/reports/view/${reportId}`;

export const getReportDownloadUrl = (reportId) =>
  `${API_BASE_URL}/reports/download/${reportId}`;
