import { useEffect, useState } from "react";
import { Download, Search, RefreshCw } from "lucide-react";
import { api } from "../api";
import { mediaUrl } from "../config";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  Th,
  Td,
  TableRow,
  TableEmpty,
  TableLoading,
} from "../components/ui/DataTable";

export default function Logs() {
  const [viewMode, setViewMode] = useState("LOGS");
  const [logs, setLogs] = useState([]);
  const [visits, setVisits] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [logRes, visitRes] = await Promise.all([
        api.get("/logs", { params: { limit: 200 } }),
        api.get("/visits"),
      ]);
      setLogs(logRes.data);
      setVisits(visitRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = logs;
    if (searchTerm) {
      result = result.filter((log) =>
        log.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((log) => log.status === statusFilter);
    }
    setFilteredLogs(result);
  }, [searchTerm, statusFilter, logs]);

  const exportCSV = () => {
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const headers =
      viewMode === "LOGS"
        ? ["ID", "Name", "Status", "Time", "Image"]
        : ["ID", "Name", "Check In", "Check Out", "Duration"];

    const rows =
      viewMode === "LOGS"
        ? filteredLogs.map((log) =>
            [
              log.id,
              log.name,
              log.status,
              new Date(log.timestamp).toLocaleString(),
              log.image_path,
            ].map(escape).join(",")
          )
        : visits.map((v) =>
            [
              v.id,
              v.name,
              v.check_in,
              v.check_out || "Active",
              v.duration || "-",
            ].map(escape).join(",")
          );

    const blob = new Blob([[headers.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      viewMode === "LOGS" ? "security_logs.csv" : "visitor_sessions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabToggle = (
    <div className="segmented-control">
      {["LOGS", "VISITS"].map((mode) => (
        <button
          key={mode}
          type="button"
          data-active={viewMode === mode ? "true" : "false"}
          onClick={() => setViewMode(mode)}
        >
          {mode === "LOGS" ? "Security logs" : "Entry / exit"}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Logs & Reports"
        description="Security audit trail and visitor session history"
        action={tabToggle}
      />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name…"
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {viewMode === "LOGS" && (
              <select
                className="input-field w-auto min-w-[160px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="AUTHORIZED">Authorized</option>
                <option value="BLACKLISTED">Blacklisted</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </Card>

      <DataTable>
        <DataTableHead>
          <TableRow>
            {viewMode === "LOGS" ? (
              <>
                <Th>Evidence</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Time</Th>
              </>
            ) : (
              <>
                <Th>Visitor</Th>
                <Th>Check in</Th>
                <Th>Check out</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
              </>
            )}
          </TableRow>
        </DataTableHead>
        <DataTableBody>
          {loading ? (
            <TableLoading colSpan={viewMode === "LOGS" ? 4 : 5} />
          ) : viewMode === "LOGS" ? (
            filteredLogs.length === 0 ? (
              <TableEmpty colSpan={4} />
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <Td>
                    {log.image_path ? (
                      <a
                        href={mediaUrl(log.image_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                      >
                        <img
                          src={mediaUrl(log.image_path)}
                          alt={`Evidence for ${log.name}`}
                          className="w-12 h-12 object-cover rounded-lg ring-1 ring-slate-300 bg-slate-100"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                            e.target.alt = "Unavailable";
                            e.target.className =
                              "w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] text-slate-500";
                          }}
                        />
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </Td>
                  <Td className="cell-strong">{log.name}</Td>
                  <Td>
                    <Badge status={log.status} />
                  </Td>
                  <Td className="tabular-nums">{new Date(log.timestamp).toLocaleString()}</Td>
                </TableRow>
              ))
            )
          ) : visits.length === 0 ? (
            <TableEmpty colSpan={5} />
          ) : (
            visits.map((visit) => (
              <TableRow key={visit.id}>
                <Td className="cell-strong">{visit.name}</Td>
                <Td className="text-emerald-800 tabular-nums">
                  {new Date(visit.check_in).toLocaleString()}
                </Td>
                <Td className="tabular-nums">
                  {visit.check_out
                    ? new Date(visit.check_out).toLocaleString()
                    : "—"}
                </Td>
                <Td className="font-medium text-brand-800">
                  {visit.duration || "On site"}
                </Td>
                <Td>
                  {visit.check_out ? (
                    <span className="inline-flex text-xs font-semibold text-slate-700 bg-slate-200 px-2.5 py-1 rounded-full">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex text-xs font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                      On site
                    </span>
                  )}
                </Td>
              </TableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
