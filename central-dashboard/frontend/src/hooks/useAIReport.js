import { useEffect, useState } from "react";
import { getAIReport } from "../services/aiService";

export default function useAIReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await getAIReport();
      setReport(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load AI report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  return {
    report,
    loading,
    error,
    refresh: loadReport,
  };
}
