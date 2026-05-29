export default function StatCard({ icon: Icon, label, value, trend, variant = "default" }) {
  const variants = {
    default: "bg-white border-slate-200",
    success: "bg-white border-emerald-200",
    warning: "bg-white border-amber-200",
    danger: "bg-white border-red-200",
    brand: "bg-white border-brand-200",
  };

  const iconColors = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-700",
    brand: "bg-brand-100 text-brand-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconColors[variant]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend != null && (
          <span className="text-xs font-medium text-slate-600">{trend}</span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </div>
  );
}
