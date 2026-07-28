import { useEffect, useState } from "react";
import { getPipelineBuilds } from "../services/pipeline.service";

export default function usePipelineBuilds(limit = 10) {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBuilds = async () => {
    try {
      setLoading(true);

      const response = await getPipelineBuilds(limit);

      setBuilds(response.data.data.builds || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load Jenkins builds.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuilds();
  }, [limit]);

  return {
    builds,
    loading,
    error,
    refresh: loadBuilds,
  };
}
