import {
  getReportDownloadUrl,
  getReportViewUrl,
} from "../../services/reportService";

const categoryIcons = {
  Pipeline: "🔄",
  "Code Quality": "🔍",
  Security: "🛡️",
  "AI Analysis": "🤖",
  Deployments: "🚀",
  Applications: "🌐",
};

const typeStyles = {
  JSON:
    "border-blue-500/30 bg-blue-500/10 text-blue-300",
  HTML:
    "border-orange-500/30 bg-orange-500/10 text-orange-300",
  Markdown:
    "border-purple-500/30 bg-purple-500/10 text-purple-300",
  PDF:
    "border-red-500/30 bg-red-500/10 text-red-300",
  Text:
    "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleString();
};

export default function ReportCard({ report }) {
  const icon =
    categoryIcons[report.category] || "📄";

  const typeClass =
    typeStyles[report.type] ||
    "border-slate-500/30 bg-slate-500/10 text-slate-300";

  const openReport = () => {
    window.open(
      getReportViewUrl(report.id),
      "_blank",
      "noopener,noreferrer"
    );
  };

  const downloadReport = () => {
    window.location.href =
      getReportDownloadUrl(report.id);
  };

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl">
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white">
              {report.name}
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              {report.source}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${typeClass}`}
        >
          {report.type}
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Filename
        </p>

        <p className="mt-2 break-all font-mono text-sm text-cyan-300">
          {report.filename}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Category
          </p>

          <p className="mt-1 text-sm font-medium text-slate-200">
            {report.category}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Availability
          </p>

          <p
            className={`mt-1 text-sm font-medium ${
              report.available
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {report.available
              ? "Available"
              : "Unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          Generated
        </p>

        <p className="mt-1 text-sm text-slate-300">
          {formatDate(report.generatedAt)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={openReport}
          disabled={!report.available}
          className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          View
        </button>

        <button
          type="button"
          onClick={downloadReport}
          disabled={!report.available}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download
        </button>
      </div>
    </article>
  );
}
