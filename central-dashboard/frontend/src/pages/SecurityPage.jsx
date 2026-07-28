import {
  Bug,
  CheckCircle2,
  Code2,
  Copy,
  Gauge,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import useSonarSummary from "../hooks/useSonarSummary";
import useTrivySummary from "../hooks/useTrivySummary";

const emptyScan = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  unknown: 0,
  total: 0,
};

function SecurityPage() {
  const {
    sonarData,
    sonarLoading,
    sonarError,
    refreshSonar,
  } = useSonarSummary();

  const {
    trivy,
    loading: trivyLoading,
    error: trivyError,
    refreshTrivy,
  } = useTrivySummary();

  const trivyCombined = trivy?.combined ?? emptyScan;
  const trivyBackend = trivy?.backend ?? emptyScan;
  const trivyFrontend = trivy?.frontend ?? emptyScan;

  const qualityGate =
    sonarData?.qualityGate ?? "Unavailable";

  const qualityGatePassed =
    String(qualityGate).toUpperCase() === "OK";

  const criticalCount =
    Number(trivyCombined.critical ?? 0);

  const highCount =
    Number(trivyCombined.high ?? 0);

  const mediumCount =
    Number(trivyCombined.medium ?? 0);

  const lowCount =
    Number(trivyCombined.low ?? 0);

  const totalVulnerabilities =
    Number(trivyCombined.total ?? 0);

  const securityStatus =
    criticalCount > 0
      ? "Critical Risk"
      : highCount > 0
        ? "High Risk"
        : mediumCount > 0
          ? "Moderate Risk"
          : "Secure";

  const securityScore = calculateSecurityScore({
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
    qualityGatePassed,
    sonarVulnerabilities:
      Number(sonarData?.vulnerabilities ?? 0),
    bugs: Number(sonarData?.bugs ?? 0),
  });

  const refreshing =
    sonarLoading || trivyLoading;

  const handleRefresh = () => {
    refreshSonar();
    refreshTrivy();
  };

  const summaryCards = [
    {
      title: "Security Score",
      value: `${securityScore}/100`,
      description: securityStatus,
      icon: ShieldCheck,
      status:
        securityScore >= 80
          ? "success"
          : securityScore >= 50
            ? "warning"
            : "danger",
    },
    {
      title: "Quality Gate",
      value: sonarLoading ? "..." : qualityGate,
      description: qualityGatePassed
        ? "SonarQube passed"
        : "SonarQube attention required",
      icon: Gauge,
      status: qualityGatePassed
        ? "success"
        : "danger",
    },
    {
      title: "Critical",
      value: trivyLoading
        ? "..."
        : criticalCount,
      description: "Critical vulnerabilities",
      icon: XCircle,
      status:
        criticalCount > 0
          ? "danger"
          : "success",
    },
    {
      title: "Total Findings",
      value: trivyLoading
        ? "..."
        : totalVulnerabilities,
      description: "Combined Trivy findings",
      icon: ShieldAlert,
      status:
        totalVulnerabilities > 0
          ? "warning"
          : "success",
    },
  ];

  const sonarMetrics = [
    {
      label: "Bugs",
      value: sonarData?.bugs ?? 0,
      icon: Bug,
    },
    {
      label: "Vulnerabilities",
      value: sonarData?.vulnerabilities ?? 0,
      icon: ShieldAlert,
    },
    {
      label: "Code Smells",
      value: sonarData?.codeSmells ?? 0,
      icon: Code2,
    },
    {
      label: "Coverage",
      value: formatPercentage(
        sonarData?.coverage
      ),
      icon: Gauge,
    },
    {
      label: "Duplicated Lines",
      value: formatPercentage(
        sonarData?.duplicatedLines
      ),
      icon: Copy,
    },
    {
      label: "Security Rating",
      value:
        sonarData?.securityRating ?? "N/A",
      icon: Shield,
    },
    {
      label: "Reliability Rating",
      value:
        sonarData?.reliabilityRating ?? "N/A",
      icon: CheckCircle2,
    },
    {
      label: "Maintainability",
      value:
        sonarData?.maintainabilityRating ??
        "N/A",
      icon: Code2,
    },
  ];

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className={[
                "mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                getRiskBadgeClasses(
                  securityStatus
                ),
              ].join(" ")}
            >
              <Shield size={14} />
              {securityStatus}
            </div>

            <h1 className="m-0 text-3xl font-bold tracking-tight lg:text-4xl">
              Security Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base">
              Monitor SonarQube code quality,
              Trivy container vulnerabilities and
              overall security risk for the
              Wanderlust platform.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Security"}
          </button>
        </div>
      </section>

      {(sonarError || trivyError) && (
        <section className="space-y-3">
          {sonarError && (
            <ErrorMessage>
              SonarQube data unavailable:{" "}
              {sonarError}
            </ErrorMessage>
          )}

          {trivyError && (
            <ErrorMessage>
              Trivy data unavailable:{" "}
              {trivyError}
            </ErrorMessage>
          )}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-sm font-medium text-[var(--text-secondary)]">
                    {card.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {card.description}
                  </p>
                </div>

                <div
                  className={[
                    "rounded-xl p-3",
                    getCardIconClasses(
                      card.status
                    ),
                  ].join(" ")}
                >
                  <Icon size={21} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="m-0 text-xl font-bold">
                Trivy Vulnerability Summary
              </h2>

              <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
                Latest archived container image
                vulnerability scan.
              </p>
            </div>

            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-bold",
                getRiskBadgeClasses(
                  securityStatus
                ),
              ].join(" ")}
            >
              {trivyLoading
                ? "Loading"
                : securityStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SeverityCard
              label="Critical"
              value={
                trivyLoading
                  ? "..."
                  : criticalCount
              }
              icon={XCircle}
              iconClassName="text-red-500"
            />

            <SeverityCard
              label="High"
              value={
                trivyLoading
                  ? "..."
                  : highCount
              }
              icon={TriangleAlert}
              iconClassName="text-orange-500"
            />

            <SeverityCard
              label="Medium"
              value={
                trivyLoading
                  ? "..."
                  : mediumCount
              }
              icon={TriangleAlert}
              iconClassName="text-yellow-500"
            />

            <SeverityCard
              label="Low"
              value={
                trivyLoading
                  ? "..."
                  : lowCount
              }
              icon={ShieldCheck}
              iconClassName="text-blue-500"
            />
          </div>

          <div className="mt-5 rounded-2xl bg-[var(--surface-secondary)] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="m-0 text-sm font-semibold">
                  Total vulnerabilities
                </p>

                <p className="mb-0 mt-1 text-xs text-[var(--text-secondary)]">
                  Backend and frontend combined
                </p>
              </div>

              <p className="m-0 text-3xl font-bold">
                {trivyLoading
                  ? "..."
                  : totalVulnerabilities}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ImageScanCard
              title="Backend Image"
              scan={trivyBackend}
              loading={trivyLoading}
            />

            <ImageScanCard
              title="Frontend Image"
              scan={trivyFrontend}
              loading={trivyLoading}
            />
          </div>

          {trivy?.source && (
            <p className="mb-0 mt-4 text-xs text-[var(--text-secondary)]">
              Source: {trivy.source}
            </p>
          )}

          {trivy?.buildReference && (
            <p className="mb-0 mt-1 text-xs text-[var(--text-secondary)]">
              Build reference:{" "}
              {trivy.buildReference}
            </p>
          )}
        </article>

        <article className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-6">
            <h2 className="m-0 text-xl font-bold">
              Security Assessment
            </h2>

            <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
              Overall status calculated from
              SonarQube and Trivy findings.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--surface-secondary)] p-6 text-center">
            <div
              className={[
                "mx-auto grid h-24 w-24 place-items-center rounded-full border-8",
                getScoreCircleClasses(
                  securityScore
                ),
              ].join(" ")}
            >
              <span className="text-2xl font-bold">
                {securityScore}
              </span>
            </div>

            <h3 className="mb-0 mt-5 text-xl font-bold">
              {securityStatus}
            </h3>

            <p className="mb-0 mt-2 text-sm text-[var(--text-secondary)]">
              Security score out of 100
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <AssessmentRow
              label="SonarQube Quality Gate"
              value={
                sonarLoading
                  ? "Checking..."
                  : qualityGate
              }
              passed={qualityGatePassed}
            />

            <AssessmentRow
              label="Critical vulnerabilities"
              value={
                trivyLoading
                  ? "Checking..."
                  : criticalCount
              }
              passed={criticalCount === 0}
            />

            <AssessmentRow
              label="High vulnerabilities"
              value={
                trivyLoading
                  ? "Checking..."
                  : highCount
              }
              passed={highCount === 0}
            />

            <AssessmentRow
              label="Sonar vulnerabilities"
              value={
                sonarLoading
                  ? "Checking..."
                  : sonarData?.vulnerabilities ??
                    0
              }
              passed={
                Number(
                  sonarData?.vulnerabilities ??
                    0
                ) === 0
              }
            />
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="m-0 text-xl font-bold">
              SonarQube Code Quality
            </h2>

            <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
              Static analysis, maintainability and
              security metrics.
            </p>
          </div>

          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              sonarLoading
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                : qualityGatePassed
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
            ].join(" ")}
          >
            {sonarLoading
              ? "Loading"
              : `Quality Gate: ${qualityGate}`}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sonarMetrics.map((metric) => (
            <SonarMetricCard
              key={metric.label}
              label={metric.label}
              value={
                sonarLoading
                  ? "..."
                  : metric.value
              }
              icon={metric.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SeverityCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}) {
  return (
    <div className="rounded-2xl bg-[var(--surface-secondary)] p-5">
      <Icon
        size={20}
        className={iconClassName}
      />

      <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="m-0 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}

function ImageScanCard({
  title,
  scan,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-bold">
            {title}
          </p>

          <p className="mb-0 mt-1 text-xs text-[var(--text-secondary)]">
            Container image findings
          </p>
        </div>

        <ShieldAlert
          size={20}
          className={
            scan.critical > 0
              ? "text-red-500"
              : scan.high > 0
                ? "text-orange-500"
                : "text-green-500"
          }
        />
      </div>

      <p className="mb-0 mt-5 text-3xl font-bold">
        {loading ? "..." : scan.total}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <SmallMetric
          label="Critical"
          value={loading ? "..." : scan.critical}
        />

        <SmallMetric
          label="High"
          value={loading ? "..." : scan.high}
        />

        <SmallMetric
          label="Medium"
          value={loading ? "..." : scan.medium}
        />

        <SmallMetric
          label="Low"
          value={loading ? "..." : scan.low}
        />
      </div>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--surface-secondary)] px-3 py-2">
      <p className="m-0 text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="mb-0 mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}

function AssessmentRow({
  label,
  value,
  passed,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-4">
      <div className="flex items-center gap-3">
        {passed ? (
          <CheckCircle2
            size={18}
            className="shrink-0 text-green-500"
          />
        ) : (
          <XCircle
            size={18}
            className="shrink-0 text-red-500"
          />
        )}

        <span className="text-sm font-semibold">
          {label}
        </span>
      </div>

      <span
        className={[
          "text-sm font-bold",
          passed
            ? "text-green-500"
            : "text-red-500",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function SonarMetricCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <article className="rounded-2xl bg-[var(--surface-secondary)] p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-blue-500">
        <Icon size={19} />
      </div>

      <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="m-0 text-2xl font-bold">
        {value}
      </p>
    </article>
  );
}

function ErrorMessage({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
      <XCircle
        size={18}
        className="shrink-0"
      />

      <span>{children}</span>
    </div>
  );
}

function calculateSecurityScore({
  critical,
  high,
  medium,
  low,
  qualityGatePassed,
  sonarVulnerabilities,
  bugs,
}) {
  let score = 100;

  score -= critical * 12;
  score -= high * 3;
  score -= medium;
  score -= low * 0.25;
  score -= sonarVulnerabilities * 5;
  score -= bugs * 1.5;

  if (!qualityGatePassed) {
    score -= 15;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function formatPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0%";
  }

  const normalizedValue = String(value);

  return normalizedValue.includes("%")
    ? normalizedValue
    : `${normalizedValue}%`;
}

function getRiskBadgeClasses(status) {
  switch (status) {
    case "Critical Risk":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";

    case "High Risk":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";

    case "Moderate Risk":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";

    default:
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
  }
}

function getCardIconClasses(status) {
  switch (status) {
    case "danger":
      return "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300";

    case "warning":
      return "bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300";

    default:
      return "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-300";
  }
}

function getScoreCircleClasses(score) {
  if (score >= 80) {
    return "border-green-500 text-green-500";
  }

  if (score >= 50) {
    return "border-yellow-500 text-yellow-500";
  }

  return "border-red-500 text-red-500";
}

export default SecurityPage;
