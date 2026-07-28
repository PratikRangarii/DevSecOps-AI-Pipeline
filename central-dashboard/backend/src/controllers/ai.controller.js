import {
  getLatestAIReport,
  getLatestAIHtmlReport,
} from "../services/ai.service.js";

export const getAIReport = async (req, res) => {
  try {
    const report = await getLatestAIReport();

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(
      "Gemini AI Report Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAIHtmlReport = async (req, res) => {
  try {
    const report = await getLatestAIHtmlReport();

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error(
      "Gemini HTML Report Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
