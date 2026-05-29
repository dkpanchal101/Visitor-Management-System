const STYLES = {
  AUTHORIZED: "bg-emerald-100 text-emerald-900 ring-emerald-600/30",
  BLACKLISTED: "bg-red-100 text-red-900 ring-red-600/30",
  UNKNOWN: "bg-amber-100 text-amber-950 ring-amber-600/30",
  "NO FACE": "bg-slate-200 text-slate-800 ring-slate-500/30",
};

export default function Badge({ status, children }) {
  const label = children || status;
  const style = STYLES[status] || STYLES.UNKNOWN;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}
