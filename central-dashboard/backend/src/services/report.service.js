import {
  getJobSummary,
  getLatestBuildDetails,
} from "./jenkins.service.js";

import {
  getProjectMeasures,
  getQualityGate,
} from "./sonarqube.service.js";

import {
  getTrivySummary,
} from "./trivy.service.js";

import {
  getLatestAIReport,
} from "./ai.service.js";

import {
  getDeploymentSummary,
} from "./deployment.service.js";

import {
  getApplicationSummary,
} from "./application.service.js";

const safeCall = async (callback, fallback = null) => {
  try {
    return await callback();
  } catch (error) {
    return {
      available: false,
      error: error.message,
      data: fallback,
    };
  }
};

const isSourceAvailable = (source) => {
  if (!source) {
    return false;
  }

  if (source.available === false && source.error) {
    return false;
  }

  return true;
};

const getPipelineStatus = (jenkins) => {
  return (
    jenkins?.latestBuild?.result ||
    jenkins?.latestBuild?.status ||
    jenkins?.summary?.lastBuild?.result ||
    jenkins?.summary?.lastBuild?.status ||
    jenkins?.summary?.status ||
    "UNKNOWN"
  );
};

const getNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return 0;
};

const getSecurityScore = ({
  sonar,
  trivy,
  ai,
}) => {
  const aiScore =
    ai?.securityScore ??
    ai?.score ??
    ai?.parsed?.securityScore ??
    ai?.analysis?.securityScore;

  if (
    typeof aiScore === "number" &&
    Number.isFinite(aiScore)
  ) {
    return Math.max(
      0,
      Math.min(100, aiScore)
    );
  }

  let score = 100;

  const criticalVulnerabilities =
    getNumber(
      trivy?.summary?.critical,
      trivy?.critical,
      trivy?.severityCounts?.CRITICAL,
      trivy?.severityCounts?.critical
    );

  const highVulnerabilities =
    getNumber(
      trivy?.summary?.high,
      trivy?.high,
      trivy?.severityCounts?.HIGH,
      trivy?.severityCounts?.high
    );

  const blockerIssues =
    getNumber(
      sonar?.measures?.issues?.blocker,
      sonar?.measures?.blockerIssues,
      sonar?.measures?.blocker_violations,
      sonar?.qualityGate?.blockerIssues
    );

  const criticalIssues =
    getNumber(
      sonar?.measures?.issues?.critical,
      sonar?.measures?.criticalIssues,
      sonar?.measures?.critical_violations,
      sonar?.qualityGate?.criticalIssues
    );

  score -= criticalVulnerabilities * 15;
  score -= highVulnerabilities * 7;
  score -= blockerIssues * 10;
  score -= criticalIssues * 5;

  return Math.max(
    0,
    Math.min(100, score)
  );
};

const getRiskLevel = ({
  ai,
  securityScore,
}) => {
  const aiRisk =
    ai?.riskLevel ||
    ai?.risk ||
    ai?.overallRisk ||
    ai?.parsed?.riskLevel ||
    ai?.analysis?.riskLevel;

  if (aiRisk) {
    return String(aiRisk).toUpperCase();
  }

  if (securityScore >= 85) {
    return "LOW";
  }

  if (securityScore >= 60) {
    return "MEDIUM";
  }

  return "HIGH";
};

const getReportType = (filename) => {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toLowerCase();

  const reportTypes = {
    html: "HTML",
    md: "Markdown",
    json: "JSON",
    txt: "Text",
    log: "Log",
    pdf: "PDF",
  };

  return (
    reportTypes[extension] ||
    "Unknown"
  );
};

const createDynamicReports = ({
  jenkins,
  sonar,
  trivy,
  ai,
  deployments,
  applications,
}) => {
  const generatedAt =
    new Date().toISOString();

 const reports = [
  {
    id: "jenkins-summary",
    name: "Jenkins Pipeline Summary",
    filename: "Jenkins_Pipeline_Report.html",
    category: "Pipeline",
    type: "HTML",
    source: "Jenkins",
    available:
      isSourceAvailable(jenkins),
    generatedAt,
    endpoint:
      "/api/reports/view/jenkins-summary",
  },
  {
    id: "sonarqube-summary",
    name: "SonarQube Quality Report",
    filename: "SonarQube_Quality_Report.html",
    category: "Code Quality",
    type: "HTML",
    source: "SonarQube",
    available:
      isSourceAvailable(sonar),
    generatedAt,
    endpoint:
      "/api/reports/view/sonarqube-summary",
  },
  {
    id: "trivy-summary",
    name: "Trivy Vulnerability Report",
    filename: "Trivy_Security_Report.html",
    category: "Security",
    type: "HTML",
    source: "Trivy",
    available:
      isSourceAvailable(trivy),
    generatedAt,
    endpoint:
      "/api/reports/view/trivy-summary",
  },
  {
    id: "ai-report-html",
    name: "Gemini AI Analysis Report",
    filename: "AI_Report.html",
    category: "AI Analysis",
    type: "HTML",
    source: "Gemini AI",
    available:
      isSourceAvailable(ai),
    generatedAt,
    endpoint:
      "/api/ai/report/html",
  },
  {
    id: "ai-report-markdown",
    name: "Gemini AI Markdown Report",
    filename: "AI_Report.md",
    category: "AI Analysis",
    type: "Markdown",
    source: "Gemini AI",
    available:
      isSourceAvailable(ai),
    generatedAt,
    endpoint:
      "/api/ai/report",
  },
  {
    id: "deployment-summary",
    name: "Docker Deployment Report",
    filename: "Docker_Deployment_Report.html",
    category: "Deployments",
    type: "HTML",
    source: "Docker",
    available:
      isSourceAvailable(deployments),
    generatedAt,
    endpoint:
      "/api/reports/view/deployment-summary",
  },
  {
    id: "application-summary",
    name: "Application Health Report",
    filename: "Application_Health_Report.html",
    category: "Applications",
    type: "HTML",
    source: "Application Monitor",
    available:
      isSourceAvailable(applications),
    generatedAt,
    endpoint:
      "/api/reports/view/application-summary",
  },
  ]; 


  return reports.map((report) => ({
    ...report,
    extension:
      report.filename
        .split(".")
        .pop(),
    detectedType:
      getReportType(
        report.filename
      ),
  }));
};

export const getReportsData = async () => {
  const [
    jenkinsSummary,
    latestBuild,
    sonarMeasures,
    sonarQualityGate,
    trivy,
    ai,
    deployments,
    applications,
  ] = await Promise.all([
    safeCall(() =>
      getJobSummary()
    ),
    safeCall(() =>
      getLatestBuildDetails()
    ),
    safeCall(() =>
      getProjectMeasures()
    ),
    safeCall(() =>
      getQualityGate()
    ),
    safeCall(() =>
      getTrivySummary()
    ),
    safeCall(() =>
      getLatestAIReport()
    ),
    safeCall(() =>
      getDeploymentSummary()
    ),
    safeCall(() =>
      getApplicationSummary()
    ),
  ]);

  const jenkins = {
    summary: jenkinsSummary,
    latestBuild,
  };

  const sonar = {
    measures: sonarMeasures,
    qualityGate:
      sonarQualityGate,
  };

  const securityScore =
    getSecurityScore({
      sonar,
      trivy,
      ai,
    });

  const riskLevel =
    getRiskLevel({
      ai,
      securityScore,
    });

  const reports =
    createDynamicReports({
      jenkins,
      sonar,
      trivy,
      ai,
      deployments,
      applications,
    });

  const availableReports =
    reports.filter(
      (report) =>
        report.available
    ).length;

  return {
    summary: {
      pipelineStatus:
        getPipelineStatus(
          jenkins
        ),

      securityScore,

      riskLevel,

      totalReports:
        reports.length,

      availableReports,

      unavailableReports:
        reports.length -
        availableReports,

      overallApplicationStatus:
        applications
          ?.overallStatus ||
        "UNKNOWN",

      runningContainers:
        deployments
          ?.summary
          ?.runningContainers ??
        0,

      totalContainers:
        deployments
          ?.summary
          ?.totalContainers ??
        0,

      generatedAt:
        new Date().toISOString(),
    },

    reports,

    sources: {
      jenkins,
      sonar,
      trivy,
      ai,
      deployments,
      applications,
    },
  };
};

export const getReportsSummary =
  async () => {
    const data =
      await getReportsData();

    return data.summary;
  };

export const getReportsList =
  async () => {
    const data =
      await getReportsData();

    return {
      generatedAt:
        data.summary
          .generatedAt,

      totalReports:
        data.summary
          .totalReports,

      availableReports:
        data.summary
          .availableReports,

      unavailableReports:
        data.summary
          .unavailableReports,

      reports:
        data.reports,
    };
  };
