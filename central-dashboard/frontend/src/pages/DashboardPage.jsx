import {
  Activity,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  RefreshCw,
  ShieldCheck,
  Timer,
  TriangleAlert,
  XCircle
} from "lucide-react";

import { useBackendHealth } from "../hooks/useBackendHealth";
import useJenkinsSummary from "../hooks/useJenkinsSummary";
import useSonarSummary from "../hooks/useSonarSummary";
import useTrivySummary from "../hooks/useTrivySummary";

function DashboardPage() {
  const {
    health,
    loading,
    error,
    refresh
  } = useBackendHealth();

  const {
    data: jenkins,
    loading: jenkinsLoading,
    error: jenkinsError,
    refresh: refreshJenkins
  } = useJenkinsSummary();

  const {
    sonarData,
    sonarLoading,
    sonarError,
    refreshSonar
  } = useSonarSummary();

  const {
    trivy,
    loading: trivyLoading,
    error: trivyError,
    refreshTrivy
  } = useTrivySummary();

  /*
   * Backend health
   */
  const backendOnline =
    !loading &&
    !error &&
    (
      health?.status === "healthy" ||
      health?.status === "ok" ||
      health?.success === true
    );

  /*
   * Jenkins information
   */
  const latestBuildStatus =
    jenkins?.latestBuild?.result ?? "Unavailable";

  const jenkinsOnline =
    Boolean(jenkins) && !jenkinsError;

  const totalBuilds = jenkinsLoading
    ? "..."
    : jenkins?.totalBuilds ?? 0;

  const successRate = jenkinsLoading
    ? "..."
    : `${jenkins?.successRate ?? 0}%`;

  const latestBuildNumber = jenkinsLoading
    ? "..."
    : jenkins?.latestBuild?.number
      ? `#${jenkins.latestBuild.number}`
      : "N/A";

  const latestBuildDuration = jenkinsLoading
    ? "..."
    : jenkins?.latestBuild?.duration ?? "N/A";

  const successfulBuilds =
    jenkins?.successfulBuilds ?? 0;

  /*
   * SonarQube information
   */
  const sonarOnline =
    Boolean(sonarData) && !sonarError;

  const qualityGate =
    sonarData?.qualityGate ?? "Unavailable";

  const qualityGatePassed =
    String(qualityGate).toUpperCase() === "OK";

  /*
   * Trivy information
   */
  const trivyOnline =
    Boolean(trivy) && !trivyError;

  const trivyCombined = trivy?.combined ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    total: 0
  };

  const trivyBackend = trivy?.backend ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    total: 0
  };

  const trivyFrontend = trivy?.frontend ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    total: 0
  };

  const hasCriticalVulnerabilities =
    trivyCombined.critical > 0;

  const hasHighVulnerabilities =
    trivyCombined.high > 0;

  /*
   * Jenkins summary cards
   */
  const cards = [
    {
      title: "Total Builds",
      value: totalBuilds,
      description: jenkinsLoading
        ? "Loading Jenkins data"
        : `${jenkins?.completedBuilds ?? 0} completed builds`,
      icon: GitBranch,
      live: jenkinsOnline
    },
    {
      title: "Success Rate",
      value: successRate,
      description: jenkinsLoading
        ? "Loading Jenkins data"
        : `${successfulBuilds} successful builds`,
      icon: CheckCircle2,
      live: jenkinsOnline
    },
    {
      title: "Latest Build",
      value: latestBuildNumber,
      description: jenkinsLoading
        ? "Checking latest pipeline"
        : `Status: ${latestBuildStatus}`,
      icon: Activity,
      live: jenkinsOnline
    },
    {
      title: "Build Duration",
      value: latestBuildDuration,
      description: jenkinsLoading
        ? "Loading Jenkins data"
        : `${latestBuildNumber} execution time`,
      icon: Timer,
      live: jenkinsOnline
    }
  ];

  /*
   * Platform services
   */
  const services = [
    {
      name: "Wanderlust Frontend",
      status: "Operational",
      online: true
    },
    {
      name: "Wanderlust Backend",
      status: "Operational",
      online: true
    },
    {
      name: "MongoDB",
      status: "Connected",
      online: true
    },
    {
      name: "Dashboard Backend",
      status: loading
        ? "Checking..."
        : backendOnline
          ? "Healthy"
          : "Offline",
      online: backendOnline
    },
    {
      name: "Jenkins Pipeline",
      status: jenkinsLoading
        ? "Checking..."
        : jenkinsError
          ? "Unavailable"
          : `${latestBuildStatus} ${latestBuildNumber}`,
      online: jenkinsOnline
    },
    {
      name: "SonarQube",
      status: sonarLoading
        ? "Checking..."
        : sonarError
          ? "Unavailable"
          : `Quality Gate: ${qualityGate}`,
      online: sonarOnline
    },
    {
      name: "Trivy Security Scan",
      status: trivyLoading
        ? "Checking..."
        : trivyError
          ? "Unavailable"
          : `${trivyCombined.total} vulnerabilities`,
      online: trivyOnline
    }
  ];

  const allServicesHealthy =
    services.every((service) => service.online);

  const refreshing =
    loading ||
    jenkinsLoading ||
    sonarLoading ||
    trivyLoading;

  const handleRefresh = () => {
    refresh();
    refreshJenkins();
    refreshSonar();
    refreshTrivy();
  };

  return (
    <div className="space-y-7">
      {/* Hero section */}
      <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:p-8">
          <div>
            <div
              className={[
                "mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                allServicesHealthy
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
              ].join(" ")}
            >
              {allServicesHealthy ? (
                <Activity size={14} />
              ) : (
                <XCircle size={14} />
              )}

              {allServicesHealthy
                ? "All core services operational"
                : "One or more services are unavailable"}
            </div>

            <h2 className="m-0 max-w-2xl text-3xl font-bold tracking-tight lg:text-4xl">
              {allServicesHealthy
                ? "Wanderlust platform is online and monitored."
                : "Wanderlust platform requires attention."}
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base">
              Central visibility for Jenkins builds, SonarQube code quality,
              Trivy vulnerabilities, AI recommendations and deployment health.
            </p>
          </div>

          <div className="flex items-end">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white no-underline shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Open Wanderlust
              <ExternalLink size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* API errors */}
      {(error ||
        jenkinsError ||
        sonarError ||
        trivyError) && (
        <section className="space-y-3">
          {error && (
            <ErrorMessage>
              Dashboard backend unavailable: {error}
            </ErrorMessage>
          )}

          {jenkinsError && (
            <ErrorMessage>
              Jenkins data unavailable: {jenkinsError}
            </ErrorMessage>
          )}

          {sonarError && (
            <ErrorMessage>
              SonarQube data unavailable: {sonarError}
            </ErrorMessage>
          )}

          {trivyError && (
            <ErrorMessage>
              Trivy data unavailable: {trivyError}
            </ErrorMessage>
          )}
        </section>
      )}

      {/* Jenkins cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(
          ({
            title,
            value,
            description,
            icon: Icon,
            live
          }) => (
            <article
              key={title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--accent-soft)] text-blue-600 dark:text-blue-300">
                  <Icon size={21} />
                </div>

                <span
                  className={[
                    "text-xs font-semibold",
                    live
                      ? "text-green-600"
                      : "text-red-500"
                  ].join(" ")}
                >
                  {live ? "Live" : "Offline"}
                </span>
              </div>

              <p className="mb-1 mt-5 text-sm text-[var(--text-secondary)]">
                {title}
              </p>

              <h3 className="m-0 text-3xl font-bold">
                {value}
              </h3>

              <p className="mb-0 mt-2 text-xs text-[var(--text-secondary)]">
                {description}
              </p>
            </article>
          )
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        {/* Platform status */}
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="m-0 text-lg font-bold">
                Platform Status
              </h3>

              <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
                Live Wanderlust and DevSecOps services
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-bold",
                  allServicesHealthy
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                ].join(" ")}
              >
                {allServicesHealthy
                  ? "Healthy"
                  : "Attention Required"}
              </span>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="rounded-xl border border-[var(--border)] p-2 text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh dashboard data"
                title="Refresh dashboard data"
              >
                <RefreshCw
                  size={17}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-secondary)] px-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {service.online ? (
                    <CheckCircle2
                      className="shrink-0 text-green-500"
                      size={19}
                    />
                  ) : (
                    <XCircle
                      className="shrink-0 text-red-500"
                      size={19}
                    />
                  )}

                  <span className="truncate text-sm font-semibold">
                    {service.name}
                  </span>
                </div>

                <span
                  className={[
                    "shrink-0 text-right text-xs font-semibold",
                    service.online
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-500"
                  ].join(" ")}
                >
                  {service.status}
                </span>
              </div>
            ))}
          </div>

          {(health?.timestamp ||
            jenkins?.latestBuild?.startedAt) && (
            <div className="mt-4 space-y-1 text-xs text-[var(--text-secondary)]">
              {health?.timestamp && (
                <p className="m-0">
                  Backend checked:{" "}
                  {new Date(
                    health.timestamp
                  ).toLocaleString()}
                </p>
              )}

              {jenkins?.latestBuild?.startedAt && (
                <p className="m-0">
                  Latest Jenkins build started:{" "}
                  {new Date(
                    jenkins.latestBuild.startedAt
                  ).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </article>

        {/* Trivy security summary */}
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0 text-lg font-bold">
                Trivy Security Summary
              </h3>

              <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
                Latest Jenkins archived image scans
              </p>
            </div>

            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-bold",
                trivyLoading
                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  : trivyError
                    ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : hasCriticalVulnerabilities
                      ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : hasHighVulnerabilities
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                        : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
              ].join(" ")}
            >
              {trivyLoading
                ? "Loading"
                : trivyError
                  ? "Unavailable"
                  : hasCriticalVulnerabilities
                    ? "Critical Risk"
                    : hasHighVulnerabilities
                      ? "High Risk"
                      : "No High Risk"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SeverityCard
              label="Critical"
              value={
                trivyLoading
                  ? "..."
                  : trivyCombined.critical
              }
              icon={XCircle}
              className="text-red-600"
            />

            <SeverityCard
              label="High"
              value={
                trivyLoading
                  ? "..."
                  : trivyCombined.high
              }
              icon={TriangleAlert}
              className="text-orange-500"
            />

            <SeverityCard
              label="Medium"
              value={
                trivyLoading
                  ? "..."
                  : trivyCombined.medium
              }
              icon={TriangleAlert}
              className="text-amber-500"
            />

            <SeverityCard
              label="Low"
              value={
                trivyLoading
                  ? "..."
                  : trivyCombined.low
              }
              icon={ShieldCheck}
              className="text-blue-500"
            />
          </div>

          <div className="mt-3 rounded-xl bg-[var(--surface-secondary)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                Total vulnerabilities
              </span>

              <span className="text-2xl font-bold">
                {trivyLoading
                  ? "..."
                  : trivyCombined.total}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <ScanTargetCard
              label="Backend Image"
              value={
                trivyLoading
                  ? "..."
                  : trivyBackend.total
              }
            />

            <ScanTargetCard
              label="Frontend Image"
              value={
                trivyLoading
                  ? "..."
                  : trivyFrontend.total
              }
            />
          </div>

          {trivy?.source && (
            <p className="mb-0 mt-4 text-xs text-[var(--text-secondary)]">
              Source: {trivy.source}
            </p>
          )}
        </article>
      </section>

      {/* SonarQube summary */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="m-0 text-lg font-bold">
              SonarQube Code Quality
            </h3>

            <p className="mb-0 mt-1 text-sm text-[var(--text-secondary)]">
              Static analysis and quality-gate metrics
            </p>
          </div>

          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              sonarLoading
                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                : sonarError
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : qualityGatePassed
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
            ].join(" ")}
          >
            {sonarLoading
              ? "Loading"
              : sonarError
                ? "Unavailable"
                : `Quality Gate: ${qualityGate}`}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Coverage"
            value={
              sonarLoading
                ? "..."
                : formatPercentage(sonarData?.coverage)
            }
          />

          <MetricCard
            label="Bugs"
            value={
              sonarLoading
                ? "..."
                : sonarData?.bugs ?? 0
            }
          />

          <MetricCard
            label="Vulnerabilities"
            value={
              sonarLoading
                ? "..."
                : sonarData?.vulnerabilities ?? 0
            }
          />

          <MetricCard
            label="Code Smells"
            value={
              sonarLoading
                ? "..."
                : sonarData?.codeSmells ?? 0
            }
          />

          <MetricCard
            label="Duplicated Lines"
            value={
              sonarLoading
                ? "..."
                : formatPercentage(
                    sonarData?.duplicatedLines
                  )
            }
          />

          <MetricCard
            label="Security Rating"
            value={
              sonarLoading
                ? "..."
                : sonarData?.securityRating ?? "N/A"
            }
          />

          <MetricCard
            label="Reliability"
            value={
              sonarLoading
                ? "..."
                : sonarData?.reliabilityRating ?? "N/A"
            }
          />

          <MetricCard
            label="Maintainability"
            value={
              sonarLoading
                ? "..."
                : sonarData?.maintainabilityRating ??
                  "N/A"
            }
          />
        </div>
      </section>
    </div>
  );
}

function ErrorMessage({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-300">
      <XCircle size={18} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function SeverityCard({
  label,
  value,
  icon: Icon,
  className
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-secondary)] p-4">
      <Icon size={18} className={className} />

      <p className="mb-1 mt-4 text-xs text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="m-0 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function ScanTargetCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-4">
      <p className="m-0 text-xs text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="mb-0 mt-2 text-xl font-bold">
        {value}
      </p>

      <p className="mb-0 mt-1 text-xs text-[var(--text-secondary)]">
        findings
      </p>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--surface-secondary)] p-4">
      <p className="m-0 text-xs text-[var(--text-secondary)]">
        {label}
      </p>

      <p className="mb-0 mt-3 text-2xl font-bold">
        {value}
      </p>
    </div>
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

export default DashboardPage;
