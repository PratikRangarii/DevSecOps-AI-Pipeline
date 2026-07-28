import {
  useMemo,
  useState,
} from "react";

import ReportCard from "../components/reports/ReportCard";
import SummaryCard from "../components/reports/SummaryCard";
import useReports from "../hooks/useReports";

const pipelineStyles = {
  SUCCESS: "text-green-400",
  FAILURE: "text-red-400",
  FAILED: "text-red-400",
  ABORTED: "text-yellow-400",
  UNSTABLE: "text-yellow-400",
  RUNNING: "text-blue-400",
  UNKNOWN: "text-slate-400",
};

const riskStyles = {
  LOW: "text-green-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
  CRITICAL: "text-red-500",
};

const getSecurityScoreClass = (score) => {
  if (score >= 85) {
    return "text-green-400";
  }

  if (score >= 60) {
    return "text-yellow-400";
  }

  return "text-red-400";
};

export default function ReportsPage() {
  const {
    summary,
    reportsData,
    loading,
    refreshing,
    error,
    refresh,
  } = useReports();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const reports =
    reportsData?.reports || [];

  const categories = useMemo(
    () => [
      ...new Set(
        reports
          .map((report) => report.category)
          .filter(Boolean)
      ),
    ],
    [reports]
  );

  const filteredReports = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesCategory =
        categoryFilter === "all" ||
        report.category === categoryFilter;

      const searchableText = [
        report.name,
        report.filename,
        report.category,
        report.source,
        report.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(
          normalizedSearch
        );

      return matchesCategory && matchesSearch;
    });
  }, [
    reports,
    categoryFilter,
    searchTerm,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-slate-400">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="text-xl font-semibold text-red-400">
            Unable to load reports
          </h2>

          <p className="mt-2 text-slate-300">
            {error}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pipelineStatus =
    String(
      summary?.pipelineStatus || "UNKNOWN"
    ).toUpperCase();

  const riskLevel =
    String(
      summary?.riskLevel || "UNKNOWN"
    ).toUpperCase();

  const securityScore =
    Number(summary?.securityScore ?? 0);

  return (
    <div className="space-y-6 p-6 text-white">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
              📑
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Reports Center
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                View and download pipeline, security,
                AI, deployment and application reports.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh Reports"}
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Pipeline Status"
          value={pipelineStatus}
          subtitle="Latest Jenkins build"
          icon="🔄"
          valueClassName={
            pipelineStyles[pipelineStatus] ||
            "text-slate-400"
          }
        />

        <SummaryCard
          title="Security Score"
          value={`${securityScore}/100`}
          subtitle="Combined security assessment"
          icon="🛡️"
          valueClassName={getSecurityScoreClass(
            securityScore
          )}
        />

        <SummaryCard
          title="Risk Level"
          value={riskLevel}
          subtitle="AI and vulnerability analysis"
          icon="⚠️"
          valueClassName={
            riskStyles[riskLevel] ||
            "text-slate-400"
          }
        />

        <SummaryCard
          title="Reports Available"
          value={`${summary?.availableReports ?? 0}/${summary?.totalReports ?? 0}`}
          subtitle={`${summary?.unavailableReports ?? 0} unavailable`}
          icon="📄"
          valueClassName="text-cyan-400"
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search reports, source, filename..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="all">
              All categories
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-slate-400">
            Showing{" "}
            <strong className="text-white">
              {filteredReports.length}
            </strong>{" "}
            report
            {filteredReports.length === 1
              ? ""
              : "s"}
          </p>

          <p className="text-slate-500">
            Generated:{" "}
            {summary?.generatedAt
              ? new Date(
                  summary.generatedAt
                ).toLocaleString()
              : "Not available"}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Available Reports
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Open reports in a new tab or download
            them directly.
          </p>
        </div>

        {filteredReports.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
            <p className="text-lg font-medium text-slate-300">
              No reports found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Change the search term or category filter.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">
          System Summary
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">
              Application Health
            </p>

            <p className="mt-1 text-xl font-semibold text-white">
              {summary?.overallApplicationStatus ||
                "UNKNOWN"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Running Containers
            </p>

            <p className="mt-1 text-xl font-semibold text-green-400">
              {summary?.runningContainers ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total Containers
            </p>

            <p className="mt-1 text-xl font-semibold text-white">
              {summary?.totalContainers ?? 0}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Report Coverage
            </p>

            <p className="mt-1 text-xl font-semibold text-cyan-400">
              {summary?.totalReports
                ? Math.round(
                    (summary.availableReports /
                      summary.totalReports) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
