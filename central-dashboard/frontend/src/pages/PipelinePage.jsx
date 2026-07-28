import {
  Activity,
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCw,
  XCircle,
  Ban,
} from "lucide-react";

import usePipelineBuilds from "../hooks/usePipelineBuilds";

const getStatusClasses = (status) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";

    case "FAILURE":
      return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";

    case "ABORTED":
      return "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

    case "UNSTABLE":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";

    case "BUILDING":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "SUCCESS":
      return CheckCircle2;

    case "FAILURE":
      return XCircle;

    case "ABORTED":
      return Ban;

    default:
      return Activity;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function PipelinePage() {
  const {
    builds,
    loading,
    error,
    refresh,
  } = usePipelineBuilds(10);

  const successfulBuilds = builds.filter(
    (build) => build.result === "SUCCESS"
  ).length;

  const failedBuilds = builds.filter(
    (build) => build.result === "FAILURE"
  ).length;

  const abortedBuilds = builds.filter(
    (build) => build.result === "ABORTED"
  ).length;

  const completedBuilds = builds.filter(
    (build) => !build.building
  ).length;

  const successRate =
    completedBuilds > 0
      ? Math.round((successfulBuilds / completedBuilds) * 100)
      : 0;

  const averageDurationMs =
    builds.length > 0
      ? builds.reduce(
          (total, build) => total + (build.durationMs || 0),
          0
        ) / builds.length
      : 0;

  const averageDurationSeconds = Math.floor(
    averageDurationMs / 1000
  );

  const averageMinutes = Math.floor(
    averageDurationSeconds / 60
  );

  const averageSeconds = averageDurationSeconds % 60;

  const latestBuild = builds[0];

  const summaryCards = [
    {
      title: "Recent Builds",
      value: builds.length,
      description: "Latest Jenkins executions",
      icon: Activity,
    },
    {
      title: "Successful",
      value: successfulBuilds,
      description: `${successRate}% success rate`,
      icon: CheckCircle2,
    },
    {
      title: "Failed",
      value: failedBuilds,
      description: `${abortedBuilds} aborted build(s)`,
      icon: XCircle,
    },
    {
      title: "Average Duration",
      value: `${averageMinutes}m ${averageSeconds}s`,
      description: "Across loaded builds",
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Activity size={14} />
              Live Jenkins Pipeline
            </div>

            <h1 className="m-0 text-3xl font-bold tracking-tight lg:text-4xl">
              Pipeline Monitoring
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)] lg:text-base">
              Monitor Jenkins build history, status, execution duration
              and recent pipeline activity.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold transition hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Refreshing..." : "Refresh Builds"}
          </button>
        </div>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-sm font-medium text-[var(--text-secondary)]">
                    {card.title}
                  </p>

                  <p className="mt-3 text-2xl font-bold">
                    {loading ? "..." : card.value}
                  </p>

                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <Icon size={20} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="m-0 text-xl font-bold">
              Recent Builds
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Latest Jenkins build executions for wanderlust-deploy.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-left text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                  <th className="px-6 py-4 font-semibold">
                    Build
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Duration
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Started
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Jenkins
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && builds.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]"
                    >
                      Loading Jenkins builds...
                    </td>
                  </tr>
                ) : builds.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-sm text-[var(--text-secondary)]"
                    >
                      No Jenkins builds found.
                    </td>
                  </tr>
                ) : (
                  builds.map((build) => {
                    const StatusIcon = getStatusIcon(
                      build.result
                    );

                    return (
                      <tr
                        key={build.number}
                        className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-muted)]"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-semibold">
                            Build #{build.number}
                          </div>

                          <div className="mt-1 text-xs text-[var(--text-secondary)]">
                            wanderlust-deploy
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                              getStatusClasses(build.result),
                            ].join(" ")}
                          >
                            <StatusIcon size={14} />
                            {build.result}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {build.duration}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {formatDate(build.startedAt)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <a
                            href={build.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                          >
                            Open
                            <ExternalLink size={14} />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h2 className="m-0 text-xl font-bold">
            Latest Build
          </h2>

          {latestBuild ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Build Number
                </p>

                <p className="mt-2 text-3xl font-bold">
                  #{latestBuild.number}
                </p>
              </div>

              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Status
                </p>

                <span
                  className={[
                    "mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                    getStatusClasses(latestBuild.result),
                  ].join(" ")}
                >
                  {latestBuild.result}
                </span>
              </div>

              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Duration
                </p>

                <p className="mt-2 font-semibold">
                  {latestBuild.duration}
                </p>
              </div>

              <div>
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Started At
                </p>

                <p className="mt-2 text-sm leading-6">
                  {formatDate(latestBuild.startedAt)}
                </p>
              </div>

              <a
                href={latestBuild.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Open in Jenkins
                <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            <p className="mt-5 text-sm text-[var(--text-secondary)]">
              Latest build information is unavailable.
            </p>
          )}
        </aside>
      </section>
    </div>
  );
}
