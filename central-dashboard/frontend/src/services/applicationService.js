const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:7000/api";

const handleResponse = async (response) => {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to fetch application status."
    );
  }

  return result.data;
};

export const getApplicationSummary = async () => {
  const response = await fetch(
    `${API_BASE_URL}/applications/summary`
  );

  return handleResponse(response);
};
