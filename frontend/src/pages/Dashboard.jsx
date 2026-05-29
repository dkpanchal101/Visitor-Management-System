import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  ScanFace,
  UserX,
  Building2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { api } from "../api";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = () =>
      api.get("/stats").then((res) => setStats(res.data)).catch(() => {});
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      to: "/surveillance",
      title: "Live Surveillance",
      desc: "Start face detection at the gate",
      icon: ScanFace,
      color: "bg-brand-600",
    },
    {
      to: "/register",
      title: "Register Visitor",
      desc: "Add a new face to the database",
      icon: Users,
      color: "bg-emerald-600",
    },
    {
      to: "/logs",
      title: "View Reports",
      desc: "Security logs and entry history",
      icon: Building2,
      color: "bg-indigo-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of today's security activity"
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Registered visitors"
          value={stats?.registeredVisitors ?? "—"}
          variant="brand"
        />
        <StatCard
          icon={Building2}
          label="Currently on site"
          value={stats?.visitorsOnSite ?? "—"}
          variant="success"
        />
        <StatCard
          icon={ScanFace}
          label="Detections today"
          value={stats?.detectionsToday ?? "—"}
          variant="default"
        />
        <StatCard
          icon={AlertTriangle}
          label="Unknown / blacklist alerts today"
          value={
            stats
              ? (stats.unknownToday ?? 0) + (stats.blacklistedAlertsToday ?? 0)
              : "—"
          }
          variant="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Quick actions" subtitle="Common security operations">
            <div className="grid sm:grid-cols-3 gap-4">
              {quickActions.map(({ to, title, desc, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="group p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-brand-300 hover:shadow-md transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-brand-700 flex items-center gap-1">
                    {title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{desc}</p>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Risk summary" subtitle="Registered threat profiles">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-red-700" />
                <span className="text-sm font-semibold text-red-950">
                  Blacklisted visitors
                </span>
              </div>
              <span className="text-xl font-bold text-red-800 tabular-nums">
                {stats?.blacklistedVisitors ?? "—"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Blacklisted individuals trigger real-time alerts when detected at
              surveillance points.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
