import { getDeploymentSummary } from "../services/deployment.service.js";

export const getDeployments = async (req, res) => {
  try {
    const deploymentData =
      await getDeploymentSummary();

    return res.status(200).json({
      success: true,
      data: deploymentData,
    });
  } catch (error) {
    console.error(
      "Deployment Summary Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
