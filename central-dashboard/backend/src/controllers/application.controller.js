import { getApplicationSummary } from "../services/application.service.js";

export const getApplications = async (
  req,
  res
) => {
  try {
    const applicationData =
      await getApplicationSummary();

    return res.status(200).json({
      success: true,
      data: applicationData,
    });
  } catch (error) {
    console.error(
      "Application Summary Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to retrieve application status.",
    });
  }
};
