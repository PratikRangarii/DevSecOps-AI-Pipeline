import axios from "axios";

const sonarClient = axios.create({
  baseURL: process.env.SONAR_URL,
  auth: {
    username: process.env.SONAR_TOKEN,
    password: "",
  },
});

export const getProjectMeasures = async () => {
  const metrics =
    "bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,reliability_rating,security_rating,sqale_rating";

  const response = await sonarClient.get(
    `/api/measures/component?component=${process.env.SONAR_PROJECT_KEY}&metricKeys=${metrics}`
  );

  return response.data.component;
};

export const getQualityGate = async () => {
  const response = await sonarClient.get(
    `/api/qualitygates/project_status?projectKey=${process.env.SONAR_PROJECT_KEY}`
  );

  return response.data.projectStatus;
};
