import {
  getReportsList,
  getReportsSummary,
} from "../services/report.service.js";

import {
  generateHtmlReport,
} from "../services/reportHtml.service.js";

const API_BASE_URL =
  process.env.API_BASE_URL ||
  "http://localhost:7000";

const reportDefinitions = {
  "jenkins-summary": {
    title:
      "Jenkins Pipeline Report",
    filename:
      "Jenkins_Pipeline_Report.html",
    reportType: "jenkins",
    source: "Jenkins",
    endpoint:
      "/api/jenkins/summary",
    outputType: "html",
  },

  "sonarqube-summary": {
    title:
      "SonarQube Quality Report",
    filename:
      "SonarQube_Quality_Report.html",
    reportType: "sonarqube",
    source: "SonarQube",
    endpoint:
      "/api/sonarqube/summary",
    outputType: "html",
  },

  "trivy-summary": {
    title:
      "Trivy Security Report",
    filename:
      "Trivy_Security_Report.html",
    reportType: "trivy",
    source: "Trivy",
    endpoint:
      "/api/trivy/summary",
    outputType: "html",
  },

  "deployment-summary": {
    title:
      "Docker Deployment Report",
    filename:
      "Docker_Deployment_Report.html",
    reportType: "deployment",
    source: "Docker",
    endpoint:
      "/api/deployments/summary",
    outputType: "html",
  },

  "application-summary": {
    title:
      "Application Health Report",
    filename:
      "Application_Health_Report.html",
    reportType: "application",
    source: "Application Monitor",
    endpoint:
      "/api/applications/summary",
    outputType: "html",
  },

  "ai-report-html": {
    title:
      "Gemini AI Analysis Report",
    filename:
      "AI_Analysis_Report.html",
    reportType: "ai",
    source: "Gemini AI",
    endpoint:
      "/api/ai/report/html",
    outputType: "passthrough",
  },

  "ai-report-markdown": {
    title:
      "Gemini AI Markdown Report",
    filename:
      "AI_Analysis_Report.md",
    reportType: "ai",
    source: "Gemini AI",
    endpoint:
      "/api/ai/report",
    outputType: "markdown",
  },
};

const getReportDefinition = (
  reportId
) => {
  const report =
    reportDefinitions[reportId];

  if (!report) {
    const error =
      new Error(
        "Report not found."
      );

    error.statusCode = 404;

    throw error;
  }

  return report;
};

const fetchSourceResponse = async (
  endpoint
) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        Accept:
          "application/json, text/html, text/markdown, text/plain",
      },
    }
  );

  if (!response.ok) {
    const error =
      new Error(
        `Report source returned HTTP ${response.status}.`
      );

    error.statusCode =
      response.status;

    throw error;
  }

  return response;
};

const buildReportContent = async (
  definition
) => {
  const response =
    await fetchSourceResponse(
      definition.endpoint
    );

  if (
    definition.outputType ===
    "passthrough"
  ) {
    return {
      content:
        await response.text(),
      contentType:
        "text/html; charset=utf-8",
    };
  }

  if (
    definition.outputType ===
    "markdown"
  ) {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const json =
        await response.json();

      const content =
        typeof json?.data === "string"
          ? json.data
          : typeof json?.report ===
              "string"
            ? json.report
            : JSON.stringify(
                json,
                null,
                2
              );

      return {
        content,
        contentType:
          "text/markdown; charset=utf-8",
      };
    }

    return {
      content:
        await response.text(),
      contentType:
        "text/markdown; charset=utf-8",
    };
  }

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let sourceData;

  if (
    contentType.includes(
      "application/json"
    )
  ) {
    sourceData =
      await response.json();
  } else {
    sourceData = {
      content:
        await response.text(),
    };
  }

  const html =
    generateHtmlReport({
      title:
        definition.title,

      reportType:
        definition.reportType,

      data:
        sourceData,

      source:
        definition.source,
    });

  return {
    content: html,
    contentType:
      "text/html; charset=utf-8",
  };
};

export const reportsSummary =
  async (req, res) => {
    try {
      const data =
        await getReportsSummary();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Reports Summary Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to generate reports summary.",
      });
    }
  };

export const reportsList =
  async (req, res) => {
    try {
      const data =
        await getReportsList();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "Reports List Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to retrieve reports.",
      });
    }
  };

export const viewReport =
  async (req, res) => {
    try {
      const definition =
        getReportDefinition(
          req.params.reportId
        );

      const {
        content,
        contentType,
      } =
        await buildReportContent(
          definition
        );

      res.setHeader(
        "Content-Type",
        contentType
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      return res
        .status(200)
        .send(content);
    } catch (error) {
      console.error(
        "View Report Error:",
        error
      );

      return res
        .status(
          error.statusCode || 500
        )
        .json({
          success: false,
          message:
            error.message ||
            "Unable to view report.",
        });
    }
  };

export const downloadReport =
  async (req, res) => {
    try {
      const definition =
        getReportDefinition(
          req.params.reportId
        );

      const {
        content,
        contentType,
      } =
        await buildReportContent(
          definition
        );

      res.setHeader(
        "Content-Type",
        contentType
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${definition.filename}"`
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      return res
        .status(200)
        .send(content);
    } catch (error) {
      console.error(
        "Download Report Error:",
        error
      );

      return res
        .status(
          error.statusCode || 500
        )
        .json({
          success: false,
          message:
            error.message ||
            "Unable to download report.",
        });
    }
  };
