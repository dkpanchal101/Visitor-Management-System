import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { socket } from "../socket";

export default function Alert() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handler = (data) => {
      setAlert(data);
      setTimeout(() => setAlert(null), 6000);
    };
    socket.on("alert", handler);
    return () => socket.off("alert", handler);
  }, []);

  if (!alert) return null;

  const isBlacklist = alert.status === "BLACKLISTED";

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border animate-slide-up ${
        isBlacklist
          ? "bg-red-600 border-red-500 text-white"
          : "bg-amber-500 border-amber-400 text-amber-950"
      }`}
    >
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <div>
        <p className="font-bold text-sm uppercase tracking-wide">
          {isBlacklist ? "Security Alert" : "Unknown Person"}
        </p>
        <p className="text-sm opacity-95">
          {alert.name} — {alert.status}
        </p>
      </div>
    </div>
  );
}
