const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api";

const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to fetch deployment information."
    );
  }

  return result.data;
};

export const getDeploymentSummary = async () => {
  const response = await fetch(
    `${API_BASE_URL}/deployments/summary`
  );

  return handleResponse(response);
};
