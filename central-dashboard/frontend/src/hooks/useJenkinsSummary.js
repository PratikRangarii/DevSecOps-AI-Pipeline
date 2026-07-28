import { useEffect, useState } from "react";
import { getJenkinsSummary } from "../services/api";

const REFRESH_INTERVAL = 30000;

export default function useJenkinsSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setError(null);

      const response = await getJenkinsSummary();

      setData(response.data.data);
    } catch (err) {
      setError(err.message || "Unable to fetch Jenkins data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();

    const interval = setInterval(fetchSummary, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchSummary,
  };
}
