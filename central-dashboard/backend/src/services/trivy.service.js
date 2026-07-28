import axios from "axios";

const {
  JENKINS_URL,
  JENKINS_USERNAME,
  JENKINS_API_TOKEN,
  JENKINS_JOB_NAME,
} = process.env;

const auth = {
  username: JENKINS_USERNAME,
  password: JENKINS_API_TOKEN,
};

const countSeverities = (report) => {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    total: 0,
  };

  const results = Array.isArray(report?.Results) ? report.Results : [];

  for (const result of results) {
    const vulnerabilities = Array.isArray(result?.Vulnerabilities)
      ? result.Vulnerabilities
      : [];

    for (const vulnerability of vulnerabilities) {
      const severity = String(
        vulnerability?.Severity || "UNKNOWN"
      ).toUpperCase();

      switch (severity) {
        case "CRITICAL":
          counts.critical += 1;
          break;

        case "HIGH":
          counts.high += 1;
          break;

        case "MEDIUM":
          counts.medium += 1;
          break;

        case "LOW":
          counts.low += 1;
          break;

        default:
          counts.unknown += 1;
      }

      counts.total += 1;
    }
  }

  return counts;
};

const downloadArtifact = async (relativePath) => {
  const encodedJobName = encodeURIComponent(JENKINS_JOB_NAME);

  const artifactUrl =
    `${JENKINS_URL}/job/${encodedJobName}` +
    `/lastSuccessfulBuild/artifact/${relativePath}`;

  const response = await axios.get(artifactUrl, {
    auth,
    timeout: 15000,
    responseType: "json",
  });

  return response.data;
};

export const getTrivySummary = async () => {
  if (
    !JENKINS_URL ||
    !JENKINS_USERNAME ||
    !JENKINS_API_TOKEN ||
    !JENKINS_JOB_NAME
  ) {
    throw new Error("Jenkins environment variables are missing");
  }

  const [backendReport, frontendReport] = await Promise.all([
    downloadArtifact("trivy-reports/trivy-backend-report.json"),
    downloadArtifact("trivy-reports/trivy-frontend-report.json"),
  ]);

  const backend = countSeverities(backendReport);
  const frontend = countSeverities(frontendReport);

  const combined = {
    critical: backend.critical + frontend.critical,
    high: backend.high + frontend.high,
    medium: backend.medium + frontend.medium,
    low: backend.low + frontend.low,
    unknown: backend.unknown + frontend.unknown,
    total: backend.total + frontend.total,
  };

  return {
    source: "Jenkins archived artifacts",
    buildReference: "lastSuccessfulBuild",
    backend,
    frontend,
    combined,
  };
};
