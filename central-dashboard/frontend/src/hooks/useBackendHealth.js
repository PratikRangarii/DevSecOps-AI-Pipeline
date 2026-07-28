import { useCallback, useEffect, useState } from "react";
import { getBackendHealth } from "../services/api";

export function useBackendHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getBackendHealth();

      setHealth(response.data);
    } catch (err) {
      setHealth(null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Dashboard backend is unreachable"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();

    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    health,
    loading,
    error,
    refresh: checkHealth
  };
}
