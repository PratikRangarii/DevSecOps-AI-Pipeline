import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getReportsList,
  getReportsSummary,
} from "../services/reportService";

export default function useReports() {
  const [summary, setSummary] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [
          summaryResponse,
          listResponse,
        ] = await Promise.all([
          getReportsSummary(),
          getReportsList(),
        ]);

        setSummary(summaryResponse);
        setReportsData(listResponse);
      } catch (fetchError) {
        setError(
          fetchError.message ||
            "Unable to load reports."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    summary,
    reportsData,
    loading,
    refreshing,
    error,
    refresh: () => fetchReports(true),
  };
}
