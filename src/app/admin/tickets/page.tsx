"use client";

import { useEffect, useState, useMemo } from "react";

type Ticket = {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: { name: string; email: string } | null;
  assignee: { name: string; email: string } | null;
  feedback: { rating: number } | null;
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400",
  in_progress: "bg-amber-500/15 text-amber-400",
  resolved: "bg-emerald-500/15 text-emerald-400",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
  high: "bg-orange-400",
  medium: "bg-blue-400",
  low: "bg-slate-500",
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin-portal/tickets")
      .then((r) => r.json())
      .then((data) => { setTickets(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.creator?.name.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [tickets, search, statusFilter, typeFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">All Tickets</h1>
        <p className="text-white/30 mt-1 text-sm font-medium">{tickets.length} total across all departments</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title, creator, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ backgroundColor: "#0f172a", color: "#94a3b8" }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ backgroundColor: "#0f172a", color: "#94a3b8" }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500/50"
        >
          <option value="all">All Types</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-widest text-white/30 bg-white/5">
              <th className="px-6 py-4 font-bold">Ticket</th>
              <th className="px-6 py-4 font-bold hidden lg:table-cell">Creator</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">Priority</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-white text-sm line-clamp-1">{ticket.title}</p>
                  <p className="text-xs text-white/20 font-mono mt-0.5">#{ticket.id.slice(0, 8)}</p>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <p className="text-sm font-semibold text-white/60">{ticket.creator?.name || "—"}</p>
                  <p className="text-xs text-white/20">{ticket.creator?.email || ""}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${ticket.type === "IT" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {ticket.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[ticket.status] || "bg-white/10 text-white/40"}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[ticket.priority] || "bg-slate-500"}`} />
                    <span className="text-xs text-white/40 capitalize">{ticket.priority}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-xs text-white/30">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/20 font-semibold">No tickets found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
