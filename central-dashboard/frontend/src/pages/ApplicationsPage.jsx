import useApplications from "../hooks/useApplications";
import ApplicationCard from "../components/applications/ApplicationCard";

const overallColor = {
  HEALTHY: "text-green-400",
  DEGRADED: "text-yellow-400",
  DOWN: "text-red-400",
};

export default function ApplicationsPage() {
  const {
    applicationData,
    loading,
    refreshing,
    error,
    refresh,
  } = useApplications();

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>
          <p className="mt-4 text-slate-400">
            Loading Applications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8">
        <h2 className="text-2xl font-bold text-red-400">
          Unable to load Applications
        </h2>

        <p className="mt-3 text-slate-300">{error}</p>

        <button
          onClick={refresh}
          className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    overallStatus,
    summary,
    frontend,
    backend,
    mongodb,
    generatedAt,
  } = applicationData;

  return (
    <div className="space-y-8 p-6">

      {/* Header */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-white">
            🌐 Applications
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor the health of your deployed applications.
          </p>

        </div>

        <button
          onClick={refresh}
          disabled={refreshing}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* Overall Status */}

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

        <h2 className="text-lg font-semibold text-white">
          Overall Health
        </h2>

        <p
          className={`mt-3 text-5xl font-bold ${
            overallColor[overallStatus]
          }`}
        >
          {overallStatus}
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-3">

          <div>
            <p className="text-slate-500">
              Total Services
            </p>

            <p className="text-3xl font-bold text-white">
              {summary.totalServices}
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Available
            </p>

            <p className="text-3xl font-bold text-green-400">
              {summary.availableServices}
            </p>
          </div>

          <div>
            <p className="text-slate-500">
              Unavailable
            </p>

            <p className="text-3xl font-bold text-red-400">
              {summary.unavailableServices}
            </p>
          </div>

        </div>

        <p className="mt-6 text-sm text-slate-500">
          Last Updated :{" "}
          {new Date(generatedAt).toLocaleString()}
        </p>

      </div>

      {/* Application Cards */}

      <div className="grid gap-6 lg:grid-cols-3">

        <ApplicationCard
          title="Wanderlust Frontend"
          icon="🌐"
          data={frontend}
        />

        <ApplicationCard
          title="Wanderlust Backend"
          icon="⚙️"
          data={backend}
        />

        <ApplicationCard
          title="MongoDB"
          icon="🍃"
          data={{
            status: mongodb.status,
            responseTime: "--",
            url: null,
            container: mongodb.container,
          }}
        />

      </div>

    </div>
  );
}
