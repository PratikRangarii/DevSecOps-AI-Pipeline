const statusColor = {
  UP: "text-green-400",
  DOWN: "text-red-400",
  DEGRADED: "text-yellow-400",
  HEALTHY: "text-green-400",
};

export default function ApplicationCard({
  title,
  icon,
  data,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>

        <div>
          <h2 className="text-xl font-semibold text-white">
            {title}
          </h2>

          <p
            className={`font-bold ${
              statusColor[data.status] || "text-slate-300"
            }`}
          >
            {data.status}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">
            Response Time
          </span>

          <span className="text-white">
            {data.responseTime ?? "--"} ms
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Container
          </span>

          <span className="text-white">
            {data.container?.running
              ? "Running"
              : "Stopped"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Health
          </span>

          <span className="text-white">
            {data.container?.health}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-400">
            Restart Count
          </span>

          <span className="text-white">
            {data.container?.restartCount}
          </span>
        </div>
      </div>

      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Open
        </a>
      )}
    </div>
  );
}
