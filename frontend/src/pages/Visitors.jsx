import { useEffect, useState } from "react";
import { Trash2, Ban, UserCheck } from "lucide-react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import PageHeader from "../components/ui/PageHeader";
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

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/visitors");
      setVisitors(res.data);
    } catch {
      toast("Failed to load visitors", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from the database?`)) return;
    try {
      await api.delete(`/visitors/${id}`);
      toast("Visitor removed", "success");
      fetchVisitors();
    } catch (err) {
      toast(err.response?.data?.error || "Delete failed", "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Visitor Directory"
        description="All enrolled faces in the recognition system"
      />

      <DataTable>
        <DataTableHead>
          <TableRow>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Enrolled</Th>
            <Th>Actions</Th>
          </TableRow>
        </DataTableHead>
        <DataTableBody>
          {loading ? (
            <TableLoading colSpan={4} />
          ) : visitors.length === 0 ? (
            <TableEmpty colSpan={4}>No visitors registered yet</TableEmpty>
          ) : (
            visitors.map((v) => (
              <TableRow key={v.id}>
                <Td className="cell-strong">{v.name}</Td>
                <Td>
                  {v.blacklisted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-900 bg-red-100 px-2.5 py-1 rounded-full">
                      <Ban className="w-3.5 h-3.5" />
                      Blacklisted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <UserCheck className="w-3.5 h-3.5" />
                      Authorized
                    </span>
                  )}
                </Td>
                <Td className="tabular-nums">
                  {v.created_at
                    ? new Date(v.created_at).toLocaleDateString()
                    : "—"}
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id, v.name)}
                    className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove visitor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Td>
              </TableRow>
            ))
          )}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
