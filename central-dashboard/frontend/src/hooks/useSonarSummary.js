import { useCallback, useEffect, useState } from "react";
import { getSonarSummary } from "../services/api";

const useSonarSummary = () => {
  const [sonarData, setSonarData] = useState(null);
  const [sonarLoading, setSonarLoading] = useState(true);
  const [sonarError, setSonarError] = useState(null);

  const refreshSonar = useCallback(async () => {
    try {
      setSonarLoading(true);
      setSonarError(null);

      const response = await getSonarSummary();

      setSonarData(response.data.data);
    } catch (error) {
      console.error("SonarQube fetch error:", error);

      setSonarError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load SonarQube data"
      );
    } finally {
      setSonarLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSonar();

    const intervalId = setInterval(refreshSonar, 30000);

    return () => clearInterval(intervalId);
  }, [refreshSonar]);

  return {
    sonarData,
    sonarLoading,
    sonarError,
    refreshSonar,
  };
};

export default useSonarSummary;
