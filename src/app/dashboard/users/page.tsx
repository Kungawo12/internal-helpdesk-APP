"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  _count: { tickets: number; assigned: number };
};

const ROLES = ["employee", "it_staff", "hr_staff", "admin"];

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-500/20 text-red-400 border-red-500/20",
  manager: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  it_staff: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  hr_staff: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  employee: "bg-slate-500/20 text-slate-500 dark:text-slate-500 border-slate-500/20",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin-portal/users");
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUser = async (id: string, data: { role?: string; active?: boolean }) => {
    setUpdating(id);
    setError("");
    const res = await fetch(`/api/admin-portal/users/${id}`, {
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
    const res = await fetch(`/api/admin-portal/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to deactivate");
    }
    await fetchUsers();
    setUpdating(null);
  };

  const deleteUserPermanently = async (id: string, name: string) => {
    if (!confirm(`Permanently delete "${name}"? This will also delete all their tickets, comments, and attachments. Cannot be undone.`)) return;
    setUpdating(id);
    setError("");
    const res = await fetch(`/api/admin-portal/users/${id}?permanent=true`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "Failed to delete user");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl bg-white dark:bg-slate-900 rounded-3xl p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">User Management</h1>
          <p className="text-slate-500 dark:text-white/30 mt-1 text-sm font-medium">
            {users.length} total · {users.filter((u) => u.active).length} active
          </p>
        </div>
        <input
          type="text"
          placeholder="Search name, email, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72 bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:placeholder:text-slate-400 dark:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 font-bold">
          {error}
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800/3 border border-slate-100 dark:border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5 text-xs uppercase tracking-widest text-slate-500 dark:text-white/30 bg-slate-100 dark:bg-slate-800/5">
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">Tickets</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:bg-slate-800/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800/10 text-slate-900 dark:text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-white/30">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-sm font-semibold text-slate-500 dark:text-white/40">{user._count.tickets} raised</span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    disabled={updating === user.id}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    style={{ backgroundColor: "transparent" }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-red-500/30 disabled:opacity-50 ${ROLE_BADGE[user.role] || ""}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} style={{ backgroundColor: "#1e293b", color: "#fff" }}>
                        {r.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${user.active ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.active ? "bg-emerald-400" : "bg-red-400"}`} />
                    {user.active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.active ? (
                      <button
                        onClick={() => deactivateUser(user.id)}
                        disabled={updating === user.id}
                        className="text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating === user.id ? "..." : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUser(user.id, { active: true })}
                        disabled={updating === user.id}
                        className="text-xs font-bold text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {updating === user.id ? "..." : "Reactivate"}
                      </button>
                    )}
                    {user.role !== "admin" && (
                      <button
                        onClick={() => deleteUserPermanently(user.id, user.name)}
                        disabled={updating === user.id}
                        className="text-xs font-bold text-red-500/40 hover:text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        title="Permanently delete user and all their data"
                      >
                        {updating === user.id ? "..." : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400 dark:text-white/20 font-semibold">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
