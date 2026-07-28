import { getTrivySummary } from "../services/trivy.service.js";

export const getTrivySummaryController = async (req, res) => {
  try {
    const summary = await getTrivySummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Trivy summary error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Trivy reports from Jenkins",
      error: error.message,
    });
  }
};
