import { useCallback, useEffect, useState } from "react";
import { getApplicationSummary } from "../services/applicationService";

export default function useApplications() {
  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getApplicationSummary();
      setApplicationData(data);
    } catch (err) {
      setError(err.message || "Unable to load application status.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applicationData,
    loading,
    refreshing,
    error,
    refresh: () => fetchApplications(true),
  };
}
