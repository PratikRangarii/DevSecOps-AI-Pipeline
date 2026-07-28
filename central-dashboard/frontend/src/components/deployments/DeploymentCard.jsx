const getStatusStyles = (container) => {
  if (container.restarting) {
    return {
      label: "Restarting",
      badge:
        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
      dot: "bg-yellow-400",
    };
  }

  if (container.running) {
    return {
      label: "Running",
      badge:
        "border-green-500/30 bg-green-500/10 text-green-400",
      dot: "bg-green-400",
    };
  }

  return {
    label: "Stopped",
    badge:
      "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-400",
  };
};

const getHealthStyles = (health) => {
  switch (health) {
    case "healthy":
      return "text-green-400";

    case "unhealthy":
      return "text-red-400";

    case "starting":
      return "text-yellow-400";

    default:
      return "text-slate-400";
  }
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleString();
};

const getServiceName = (container) =>
  container.compose?.service || container.name;

export default function DeploymentCard({ container }) {
  const status = getStatusStyles(container);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-xl">
              🐳
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-white">
                {getServiceName(container)}
              </h3>

              <p className="truncate text-sm text-slate-400">
                {container.name}
              </p>
            </div>
          </div>
        </div>

        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${status.badge}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${status.dot}`}
          />

          {status.label}
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Docker Image
        </p>

        <p className="mt-2 break-all font-mono text-sm text-cyan-300">
          {container.image}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Health
          </p>

          <p
            className={`mt-1 font-medium capitalize ${getHealthStyles(
              container.health
            )}`}
          >
            {container.health || "Unknown"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Uptime
          </p>

          <p className="mt-1 font-medium text-slate-200">
            {container.uptime}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Restarts
          </p>

          <p className="mt-1 font-medium text-slate-200">
            {container.restartCount}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Exit Code
          </p>

          <p
            className={`mt-1 font-medium ${
              container.exitCode === 0
                ? "text-slate-200"
                : "text-red-400"
            }`}
          >
            {container.exitCode ?? "N/A"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-slate-800 pt-5 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Compose Project
          </p>

          <p className="mt-1 break-all text-sm text-slate-300">
            {container.compose?.project || "Not configured"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Network
          </p>

          <p className="mt-1 break-all text-sm text-slate-300">
            {container.networkMode || "Unknown"}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Started
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {formatDate(container.startedAt)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Container ID
          </p>

          <p className="mt-1 font-mono text-sm text-slate-300">
            {container.shortId}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-5">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Ports
        </p>

        {container.ports?.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {container.ports.map((port, index) => (
              <span
                key={`${container.id}-${port.mapping}-${index}`}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 font-mono text-xs text-slate-300"
              >
                {port.mapping}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No exposed ports
          </p>
        )}
      </div>
    </article>
  );
}
