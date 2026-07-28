import { useCallback, useEffect, useState } from "react";
import { getTrivySummary } from "../services/api";

const useTrivySummary = (refreshInterval = 30000) => {
  const [trivy, setTrivy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshTrivy = useCallback(async () => {
    try {
      setError(null);

      const response = await getTrivySummary();

      setTrivy(response.data.data);
    } catch (err) {
      console.error("Failed to fetch Trivy summary:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load Trivy data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTrivy();

    const interval = setInterval(refreshTrivy, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshTrivy, refreshInterval]);

  return {
    trivy,
    loading,
    error,
    refreshTrivy,
  };
};

export default useTrivySummary;
