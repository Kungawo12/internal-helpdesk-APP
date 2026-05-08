"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  _count: { tickets: number; assigned: number };
};

const ROLES = ["employee", "it_staff", "hr_staff", "manager", "admin"];

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (id: string, data: { role?: string; active?: boolean }) => {
    setUpdating(id);
    setError("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Update failed");
    }
    await fetchUsers();
    setUpdating(null);
  };

  const deactivateUser = async (id: string) => {
    if (!confirm("Deactivate this user? They will not be able to log in.")) return;
    setUpdating(id);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to deactivate");
    }
    await fetchUsers();
    setUpdating(null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-purple-100 text-purple-700",
    it_staff: "bg-blue-100 text-blue-700",
    hr_staff: "bg-amber-100 text-amber-700",
    employee: "bg-slate-100 text-slate-600",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto page-reveal">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="badge badge-slate !px-4 !py-2 !text-xs uppercase tracking-widest mb-3 inline-block">Admin Panel</span>
          <h1 className="text-4xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1 font-medium">{users.length} total users · {users.filter(u => u.active).length} active</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
          className="w-full md:w-72 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">Tickets</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm font-semibold text-slate-500">{user._count.tickets} raised</span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    disabled={updating === user.id || user.id === session?.user?.id}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 disabled:opacity-50 ${roleBadgeColor[user.role] || ""}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ").toUpperCase()}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-emerald-500" : "bg-red-400"}`} />
                    {user.active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.id !== session?.user?.id && (
                    user.active ? (
                      <button
                        onClick={() => deactivateUser(user.id)}
                        disabled={updating === user.id}
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating === user.id ? "..." : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUser(user.id, { active: true })}
                        disabled={updating === user.id}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating === user.id ? "..." : "Reactivate"}
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 font-semibold">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
