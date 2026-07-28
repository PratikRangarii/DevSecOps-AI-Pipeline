import { useMemo, useState } from "react";

import DeploymentCard from "../components/deployments/DeploymentCard";
import useDeployments from "../hooks/useDeployments";

const SummaryCard = ({
  title,
  value,
  subtitle,
  valueClassName = "text-white",
}) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
    <p className="text-sm text-slate-400">
      {title}
    </p>

    <p
      className={`mt-2 text-3xl font-bold ${valueClassName}`}
    >
      {value}
    </p>

    {subtitle && (
      <p className="mt-2 text-xs text-slate-500">
        {subtitle}
      </p>
    )}
  </div>
);

const getApplicationContainer = (container) => {
  const project = String(
    container.compose?.project || ""
  ).toLowerCase();

  const service = String(
    container.compose?.service || ""
  ).toLowerCase();

  const name = String(container.name || "").toLowerCase();

  return (
    project.includes("wanderlust") ||
    ["frontend", "backend", "mongodb", "mongo"].includes(
      service
    ) ||
    ["frontend", "backend", "mongodb", "mongo"].includes(
      name
    )
  );
};

export default function DeploymentsPage() {
  const {
    deploymentData,
    loading,
    refreshing,
    error,
    refresh,
  } = useDeployments();

  const [showInfrastructure, setShowInfrastructure] =
    useState(false);

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [searchTerm, setSearchTerm] =
    useState("");

  const containers = deploymentData?.containers || [];

  const applicationContainers = useMemo(
    () => containers.filter(getApplicationContainer),
    [containers]
  );

  const infrastructureContainers = useMemo(
    () => containers.filter(
      (container) => !getApplicationContainer(container)
    ),
    [containers]
  );

  const visibleContainers = useMemo(() => {
    const sourceContainers = showInfrastructure
      ? containers
      : applicationContainers;

    return sourceContainers.filter((container) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "running" &&
          container.running) ||
        (statusFilter === "stopped" &&
          !container.running) ||
        (statusFilter === "healthy" &&
          container.health === "healthy") ||
        (statusFilter === "unhealthy" &&
          container.health === "unhealthy");

      const searchableText = [
        container.name,
        container.image,
        container.compose?.project,
        container.compose?.service,
        container.networkMode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(
        searchTerm.trim().toLowerCase()
      );

      return matchesStatus && matchesSearch;
    });
  }, [
    containers,
    applicationContainers,
    showInfrastructure,
    statusFilter,
    searchTerm,
  ]);

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-slate-400">
            Loading Docker deployments...
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
            Unable to load deployments
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

  const summary = deploymentData?.summary || {};

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
              🚀
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Deployments
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Live Docker container and application deployment status
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
            : "Refresh Deployments"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 text-slate-300">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  deploymentData?.dockerConnected
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              />

              Docker{" "}
              {deploymentData?.dockerConnected
                ? "Connected"
                : "Disconnected"}
            </span>

            <span className="text-slate-400">
              Environment:{" "}
              <strong className="capitalize text-slate-200">
                {deploymentData?.environment || "Unknown"}
              </strong>
            </span>
          </div>

          <span className="text-slate-500">
            Updated:{" "}
            {formatDate(deploymentData?.generatedAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          title="Total Containers"
          value={summary.totalContainers ?? 0}
          subtitle={`${applicationContainers.length} application containers`}
        />

        <SummaryCard
          title="Running"
          value={summary.runningContainers ?? 0}
          valueClassName="text-green-400"
        />

        <SummaryCard
          title="Stopped"
          value={summary.stoppedContainers ?? 0}
          valueClassName="text-red-400"
        />

        <SummaryCard
          title="Healthy"
          value={summary.healthyContainers ?? 0}
          valueClassName="text-cyan-400"
        />

        <SummaryCard
          title="Docker Images"
          value={summary.totalImages ?? 0}
          valueClassName="text-purple-400"
        />
      </div>

      {applicationContainers.some(
        (container) => !container.running
      ) && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
          <div className="flex gap-3">
            <span className="text-xl">
              ⚠️
            </span>

            <div>
              <h2 className="font-semibold text-yellow-300">
                Application deployment attention required
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-300">
                One or more Wanderlust application containers
                are currently stopped. Check the backend logs
                first because the frontend may depend on it.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Search container, image, project, service..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="all">
              All statuses
            </option>

            <option value="running">
              Running
            </option>

            <option value="stopped">
              Stopped
            </option>

            <option value="healthy">
              Healthy
            </option>

            <option value="unhealthy">
              Unhealthy
            </option>
          </select>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={showInfrastructure}
              onChange={(event) =>
                setShowInfrastructure(
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-blue-600"
            />

            Show infrastructure
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-slate-400">
            Showing{" "}
            <strong className="text-white">
              {visibleContainers.length}
            </strong>{" "}
            container
            {visibleContainers.length === 1 ? "" : "s"}
          </p>

          {!showInfrastructure && (
            <p className="text-slate-500">
              {infrastructureContainers.length} infrastructure
              container
              {infrastructureContainers.length === 1
                ? ""
                : "s"}{" "}
              hidden
            </p>
          )}
        </div>
      </section>

      {visibleContainers.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {visibleContainers.map((container) => (
            <DeploymentCard
              key={container.id}
              container={container}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">
          <p className="text-lg font-medium text-slate-300">
            No containers found
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Change the filters or enable infrastructure
            containers.
          </p>
        </div>
      )}
    </div>
  );
}
