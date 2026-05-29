import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ScanFace,
  UserPlus,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Alert from "./Alert";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? "bg-brand-600 text-white shadow-sm"
      : "text-slate-400 hover:bg-slate-800 hover:text-white"
  }`;

export default function Layout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const nav = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/surveillance", icon: ScanFace, label: "Live Surveillance" },
    { to: "/register", icon: UserPlus, label: "Register Visitor" },
    { to: "/logs", icon: ClipboardList, label: "Logs & Reports" },
    { to: "/visitors", icon: Users, label: "Visitor Directory" },
  ];

  if (isSuperAdmin) {
    nav.push({ to: "/users", icon: Settings, label: "User Management" });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Alert />

      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-tight">SecureVMS</h1>
              <p className="text-xs text-slate-500">Visitor Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-3 mb-2 rounded-lg bg-slate-800/50">
            <p className="text-sm font-medium text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {user?.role === "SUPER_ADMIN" ? "Super Administrator" : "Administrator"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-950/50 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-100 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
