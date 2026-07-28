const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatLabel = (key = "") =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const getStatusClass = (value) => {
  const normalized =
    String(value || "").toUpperCase();

  const successValues = [
    "SUCCESS",
    "PASSED",
    "PASS",
    "OK",
    "UP",
    "RUNNING",
    "HEALTHY",
    "AVAILABLE",
    "LOW",
    "GREEN",
  ];

  const warningValues = [
    "WARNING",
    "WARN",
    "UNSTABLE",
    "MEDIUM",
    "DEGRADED",
    "PENDING",
    "YELLOW",
  ];

  const dangerValues = [
    "FAILURE",
    "FAILED",
    "FAIL",
    "DOWN",
    "STOPPED",
    "CRITICAL",
    "HIGH",
    "ERROR",
    "RED",
  ];

  if (successValues.includes(normalized)) {
    return "status-success";
  }

  if (warningValues.includes(normalized)) {
    return "status-warning";
  }

  if (dangerValues.includes(normalized)) {
    return "status-danger";
  }

  return "status-neutral";
};

const isStatusField = (key = "") => {
  const normalized = key.toLowerCase();

  return [
    "status",
    "result",
    "state",
    "health",
    "risk",
    "qualitygate",
    "quality_gate",
  ].some((word) =>
    normalized.includes(word)
  );
};

const renderPrimitive = (key, value) => {
  const displayValue =
    formatValue(value);

  if (isStatusField(key)) {
    return `
      <div class="metric-card">
        <div class="metric-label">
          ${escapeHtml(formatLabel(key))}
        </div>

        <div class="status-badge ${getStatusClass(
          displayValue
        )}">
          ${escapeHtml(displayValue)}
        </div>
      </div>
    `;
  }

  return `
    <div class="metric-card">
      <div class="metric-label">
        ${escapeHtml(formatLabel(key))}
      </div>

      <div class="metric-value">
        ${escapeHtml(displayValue)}
      </div>
    </div>
  `;
};

const renderObjectTable = (object) => {
  const entries =
    Object.entries(object || {});

  if (entries.length === 0) {
    return `
      <div class="empty-state">
        No report data available.
      </div>
    `;
  }

  return `
    <div class="metrics-grid">
      ${entries
        .map(([key, value]) => {
          if (
            value === null ||
            typeof value !== "object"
          ) {
            return renderPrimitive(
              key,
              value
            );
          }

          return "";
        })
        .join("")}
    </div>
  `;
};

const renderArray = (title, items) => {
  if (!items?.length) {
    return `
      <section class="report-section">
        <h2>${escapeHtml(title)}</h2>

        <div class="empty-state">
          No records found.
        </div>
      </section>
    `;
  }

  return `
    <section class="report-section">
      <h2>${escapeHtml(title)}</h2>

      <div class="record-list">
        ${items
          .map(
            (item, index) => `
              <article class="record-card">
                <div class="record-number">
                  ${index + 1}
                </div>

                ${
                  item &&
                  typeof item === "object"
                    ? renderObjectTable(item)
                    : `
                      <div class="metric-value">
                        ${escapeHtml(
                          formatValue(item)
                        )}
                      </div>
                    `
                }
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
};

const renderNestedSections = (
  data,
  parentTitle = ""
) => {
  if (!data || typeof data !== "object") {
    return "";
  }

  return Object.entries(data)
    .map(([key, value]) => {
      if (
        value === null ||
        typeof value !== "object"
      ) {
        return "";
      }

      const title =
        parentTitle
          ? `${parentTitle} - ${formatLabel(
              key
            )}`
          : formatLabel(key);

      if (Array.isArray(value)) {
        return renderArray(
          title,
          value
        );
      }

      return `
        <section class="report-section">
          <h2>${escapeHtml(title)}</h2>

          ${renderObjectTable(value)}

          ${renderNestedSections(
            value,
            title
          )}
        </section>
      `;
    })
    .join("");
};

const getReportIcon = (reportType) => {
  const icons = {
    jenkins: "🔄",
    sonarqube: "🔍",
    trivy: "🛡️",
    deployment: "🚀",
    application: "🌐",
    ai: "🤖",
    executive: "📊",
  };

  return icons[reportType] || "📄";
};

const getReportDescription = (
  reportType
) => {
  const descriptions = {
    jenkins:
      "Pipeline execution, build status and Jenkins job information.",

    sonarqube:
      "Code quality, quality gate and software maintainability assessment.",

    trivy:
      "Container image vulnerability and security scan findings.",

    deployment:
      "Docker container deployment and runtime status.",

    application:
      "Frontend, backend and database health information.",

    ai:
      "AI-generated DevSecOps analysis and recommendations.",

    executive:
      "Combined pipeline, security, deployment and application overview.",
  };

  return (
    descriptions[reportType] ||
    "DevSecOps report generated by the Control Center."
  );
};

const getStyles = () => `
  :root {
    color-scheme: dark;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background:
      radial-gradient(
        circle at top right,
        rgba(37, 99, 235, 0.16),
        transparent 32%
      ),
      #020617;
    color: #e2e8f0;
    line-height: 1.5;
  }

  .page {
    width: min(1180px, calc(100% - 32px));
    margin: 32px auto;
  }

  .report-header {
    position: relative;
    overflow: hidden;
    padding: 32px;
    border: 1px solid #1e293b;
    border-radius: 20px;
    background:
      linear-gradient(
        135deg,
        rgba(15, 23, 42, 0.98),
        rgba(30, 41, 59, 0.92)
      );
    box-shadow:
      0 24px 60px
      rgba(0, 0, 0, 0.28);
  }

  .report-header::after {
    content: "";
    position: absolute;
    width: 240px;
    height: 240px;
    top: -120px;
    right: -80px;
    border-radius: 999px;
    background:
      rgba(59, 130, 246, 0.14);
  }

  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .report-icon {
    display: flex;
    width: 68px;
    height: 68px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border: 1px solid
      rgba(96, 165, 250, 0.25);
    border-radius: 18px;
    background:
      rgba(37, 99, 235, 0.12);
    font-size: 32px;
  }

  h1 {
    margin: 0;
    color: #f8fafc;
    font-size: clamp(
      26px,
      4vw,
      40px
    );
    line-height: 1.15;
  }

  .report-description {
    max-width: 760px;
    margin: 10px 0 0;
    color: #94a3b8;
  }

  .report-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }

  .metadata-item {
    padding: 8px 12px;
    border: 1px solid #334155;
    border-radius: 999px;
    background: rgba(
      15,
      23,
      42,
      0.7
    );
    color: #cbd5e1;
    font-size: 13px;
  }

  .report-section {
    margin-top: 24px;
    padding: 24px;
    border: 1px solid #1e293b;
    border-radius: 18px;
    background:
      rgba(15, 23, 42, 0.9);
    box-shadow:
      0 16px 36px
      rgba(0, 0, 0, 0.16);
  }

  .report-section h2 {
    margin: 0 0 18px;
    color: #f8fafc;
    font-size: 20px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns:
      repeat(
        auto-fit,
        minmax(210px, 1fr)
      );
    gap: 14px;
  }

  .metric-card {
    min-width: 0;
    padding: 18px;
    border: 1px solid #263449;
    border-radius: 14px;
    background:
      rgba(2, 6, 23, 0.58);
  }

  .metric-label {
    margin-bottom: 8px;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .metric-value {
    overflow-wrap: anywhere;
    color: #e2e8f0;
    font-size: 17px;
    font-weight: 600;
    white-space: pre-wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    border: 1px solid;
    border-radius: 999px;
    padding: 7px 12px;
    font-size: 13px;
    font-weight: 800;
  }

  .status-success {
    border-color:
      rgba(34, 197, 94, 0.35);
    background:
      rgba(34, 197, 94, 0.12);
    color: #4ade80;
  }

  .status-warning {
    border-color:
      rgba(234, 179, 8, 0.35);
    background:
      rgba(234, 179, 8, 0.12);
    color: #facc15;
  }

  .status-danger {
    border-color:
      rgba(239, 68, 68, 0.35);
    background:
      rgba(239, 68, 68, 0.12);
    color: #f87171;
  }

  .status-neutral {
    border-color:
      rgba(148, 163, 184, 0.3);
    background:
      rgba(148, 163, 184, 0.08);
    color: #cbd5e1;
  }

  .record-list {
    display: grid;
    gap: 14px;
  }

  .record-card {
    position: relative;
    padding: 20px 20px 20px 64px;
    border: 1px solid #263449;
    border-radius: 14px;
    background:
      rgba(2, 6, 23, 0.5);
  }

  .record-number {
    position: absolute;
    top: 18px;
    left: 18px;
    display: flex;
    width: 30px;
    height: 30px;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    background:
      rgba(37, 99, 235, 0.18);
    color: #93c5fd;
    font-size: 13px;
    font-weight: 800;
  }

  .empty-state {
    padding: 28px;
    border: 1px dashed #334155;
    border-radius: 14px;
    color: #64748b;
    text-align: center;
  }

  .report-footer {
    margin-top: 24px;
    padding: 20px;
    border-top: 1px solid #1e293b;
    color: #64748b;
    font-size: 13px;
    text-align: center;
  }

  .print-button {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 10;
    border: 0;
    border-radius: 12px;
    padding: 12px 18px;
    background: #2563eb;
    color: white;
    cursor: pointer;
    font: inherit;
    font-weight: 700;
    box-shadow:
      0 12px 28px
      rgba(37, 99, 235, 0.34);
  }

  .print-button:hover {
    background: #1d4ed8;
  }

  @media print {
    :root {
      color-scheme: light;
    }

    body {
      background: white;
      color: #0f172a;
    }

    .page {
      width: 100%;
      margin: 0;
    }

    .report-header,
    .report-section {
      break-inside: avoid;
      border-color: #cbd5e1;
      background: white;
      box-shadow: none;
    }

    .metric-card,
    .record-card {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    h1,
    .report-section h2,
    .metric-value {
      color: #0f172a;
    }

    .print-button {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .page {
      width:
        min(
          100% - 20px,
          1180px
        );
      margin: 10px auto;
    }

    .report-header,
    .report-section {
      padding: 18px;
    }

    .header-content {
      align-items: flex-start;
    }

    .report-icon {
      width: 54px;
      height: 54px;
      font-size: 26px;
    }
  }
`;

export const generateHtmlReport = ({
  title,
  reportType,
  data,
  source,
}) => {
  const generatedAt =
    new Date().toLocaleString(
      "en-IN",
      {
        dateStyle: "full",
        timeStyle: "medium",
      }
    );

  const normalizedData =
    data?.data ?? data ?? {};

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          ${escapeHtml(title)}
        </title>

        <style>
          ${getStyles()}
        </style>
      </head>

      <body>
        <main class="page">
          <header class="report-header">
            <div class="header-content">
              <div class="report-icon">
                ${getReportIcon(reportType)}
              </div>

              <div>
                <h1>
                  ${escapeHtml(title)}
                </h1>

                <p class="report-description">
                  ${escapeHtml(
                    getReportDescription(
                      reportType
                    )
                  )}
                </p>
              </div>
            </div>

            <div class="report-metadata">
              <span class="metadata-item">
                Source:
                ${escapeHtml(source)}
              </span>

              <span class="metadata-item">
                Generated:
                ${escapeHtml(generatedAt)}
              </span>

              <span class="metadata-item">
                Format: HTML
              </span>

              <span class="metadata-item">
                DevSecOps Control Center
              </span>
            </div>
          </header>

          <section class="report-section">
            <h2>Executive Summary</h2>

            ${renderObjectTable(
              normalizedData
            )}
          </section>

          ${renderNestedSections(
            normalizedData
          )}

          <footer class="report-footer">
            Generated automatically by
            AI-Powered DevSecOps Control Center.
          </footer>
        </main>

        <button
          class="print-button"
          type="button"
          onclick="window.print()"
        >
          Print / Save PDF
        </button>
      </body>
    </html>
  `;
};
