export default function Card({
  title,
  subtitle,
  children,
  className = "",
  action,
  noPadding = false,
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-white rounded-t-2xl">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}
