import {
  getProjectMeasures,
  getQualityGate,
} from "../services/sonarqube.service.js";

export const getSonarSummary = async (req, res) => {
  try {
    const measures = await getProjectMeasures();
    const qualityGate = await getQualityGate();

    const metricMap = {};

    measures.measures.forEach((m) => {
      metricMap[m.metric] = m.value;
    });

    res.json({
      success: true,
      data: {
        project: measures.key,
        qualityGate: qualityGate.status,

        bugs: metricMap.bugs || 0,
        vulnerabilities: metricMap.vulnerabilities || 0,
        codeSmells: metricMap.code_smells || 0,

        coverage: metricMap.coverage || "0",

        duplicatedLines:
          metricMap.duplicated_lines_density || "0",

        reliabilityRating:
          metricMap.reliability_rating || "-",

        securityRating:
          metricMap.security_rating || "-",

        maintainabilityRating:
          metricMap.sqale_rating || "-",
      },
    });
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch SonarQube data",
    });
  }
};
