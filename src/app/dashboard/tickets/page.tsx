"use client";

import { useEffect, useState, useMemo } from "react";
import SlaBadge from "@/components/ui/SlaBadge";

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
  slaResolutionDue: string | null;
  slaBreached: boolean;
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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [wipeConfirm, setWipeConfirm] = useState("");
  const [wiping, setWiping] = useState(false);
  const [wipeMsg, setWipeMsg] = useState("");
  const [showWipePanel, setShowWipePanel] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin-portal/tickets");
      if (res.ok) setTickets(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

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

  const deleteTicket = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin-portal/tickets/${id}`, { method: "DELETE" });
    await fetchTickets();
    setDeleting(null);
  };

  const wipeAll = async () => {
    if (wipeConfirm !== "WIPE") return;
    setWiping(true);
    setWipeMsg("");
    const res = await fetch("/api/admin-portal/wipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target: "tickets", confirm: "WIPE" }),
    });
    const data = await res.json();
    setWipeMsg(res.ok ? data.message : data.error);
    setWiping(false);
    setWipeConfirm("");
    if (res.ok) await fetchTickets();
  };

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
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Tickets</h1>
          <p className="text-slate-500 dark:text-white/30 mt-1 text-sm font-medium">{tickets.length} total across all departments</p>
        </div>
        <button
          onClick={() => setShowWipePanel(!showWipePanel)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-bold text-red-400 transition-all"
        >
          ⚠ Danger Zone
        </button>
      </div>

      {/* Danger Zone */}
      {showWipePanel && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <div>
            <h2 className="text-sm font-extrabold text-red-400 uppercase tracking-widest mb-1">Wipe All Tickets</h2>
            <p className="text-xs text-slate-500 dark:text-white/40">Permanently deletes every ticket, comment, attachment, and feedback. Cannot be undone.</p>
          </div>
          {wipeMsg && (
            <p className={`text-sm font-bold ${wipeMsg.includes("wiped") ? "text-emerald-400" : "text-red-400"}`}>{wipeMsg}</p>
          )}
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder='Type "WIPE" to confirm'
              value={wipeConfirm}
              onChange={(e) => setWipeConfirm(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:text-slate-500 dark:placeholder:text-white/20 focus:outline-none focus:border-red-500/50 w-56"
            />
            <button
              onClick={wipeAll}
              disabled={wipeConfirm !== "WIPE" || wiping}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-slate-900 dark:text-white text-sm font-extrabold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              {wiping ? "Wiping..." : "Wipe All Tickets"}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by title, creator, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:text-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          
          className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50"
        >
          <option value="all">All Types</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-50 dark:bg-slate-800/3 border border-slate-100 dark:border-white/8 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5 text-xs uppercase tracking-widest text-slate-500 dark:text-white/30 bg-slate-100 dark:bg-slate-800/5">
              <th className="px-6 py-4 font-bold">Ticket</th>
              <th className="px-6 py-4 font-bold hidden lg:table-cell">Creator</th>
              <th className="px-6 py-4 font-bold">Type</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">Priority</th>
              <th className="px-6 py-4 font-bold hidden md:table-cell">Date</th>
              <th className="px-6 py-4 font-bold text-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket) => (
              <tr key={ticket.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-100 dark:bg-slate-800/5 transition-colors">
                 <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{ticket.title}</p>
                     <SlaBadge ticket={ticket} />
                   </div>
                   <p className="text-xs text-white/20 font-mono mt-0.5">#{ticket.id.slice(0, 8)}</p>
                 </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <p className="text-sm font-semibold text-slate-500 dark:text-white/60">{ticket.creator?.name || "—"}</p>
                  <p className="text-xs text-white/20">{ticket.creator?.email || ""}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${ticket.type === "IT" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {ticket.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[ticket.status] || "bg-white dark:bg-slate-800/10 text-slate-500 dark:text-white/40"}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[ticket.priority] || "bg-slate-500"}`} />
                    <span className="text-xs text-slate-500 dark:text-white/40 capitalize">{ticket.priority}</span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-xs text-slate-500 dark:text-white/30">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => deleteTicket(ticket.id, ticket.title)}
                    disabled={deleting === ticket.id}
                    className="text-xs font-bold text-red-400/50 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                  >
                    {deleting === ticket.id ? "..." : "Delete"}
                  </button>
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
