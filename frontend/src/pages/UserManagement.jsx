import { useEffect, useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { api } from "../api";
import { useToast } from "../context/ToastContext";
import { ROLES } from "../config";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  Th,
  Td,
  TableRow,
} from "../components/ui/DataTable";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: ROLES.ADMIN,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast("Failed to load users", "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast("User deleted", "success");
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.error || "Delete failed", "error");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users", form);
      toast("User created", "success");
      setForm({ username: "", password: "", role: ROLES.ADMIN });
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.error || "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Manage administrator accounts (super admin only)"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="System users" subtitle={`${users.length} accounts`} noPadding>
          <DataTable className="border-0 shadow-none rounded-none rounded-b-2xl">
            <DataTableHead>
              <TableRow>
                <Th>Username</Th>
                <Th>Role</Th>
                <Th className="w-16"> </Th>
              </TableRow>
            </DataTableHead>
            <DataTableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <Td className="cell-strong">{u.username}</Td>
                  <Td>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === ROLES.SUPER_ADMIN
                          ? "bg-violet-100 text-violet-900"
                          : "bg-brand-100 text-brand-900"
                      }`}
                    >
                      {u.role === ROLES.SUPER_ADMIN ? "Super Admin" : "Admin"}
                    </span>
                  </Td>
                  <Td>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id, u.username)}
                      className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Td>
                </TableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </Card>

        <Card title="Add user" subtitle="Minimum 8 character password">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="input-field"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1.5">
                Role
              </label>
              <select
                className="input-field"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              {loading ? "Creating…" : "Create user"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
