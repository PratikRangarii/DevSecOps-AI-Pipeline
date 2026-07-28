export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  valueClassName = "text-white",
}) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
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

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-xl">
          {icon}
        </div>
      </div>
    </article>
  );
}
