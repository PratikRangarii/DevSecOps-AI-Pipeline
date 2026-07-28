import { useCallback, useEffect, useState } from "react";

import { getDeploymentSummary } from "../services/deploymentService";

export default function useDeployments() {
  const [deploymentData, setDeploymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDeployments = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await getDeploymentSummary();

        setDeploymentData(data);
      } catch (fetchError) {
        setError(
          fetchError.message ||
            "Unable to load deployment information."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  const refresh = () => {
    fetchDeployments(true);
  };

  return {
    deploymentData,
    loading,
    refreshing,
    error,
    refresh,
  };
}
