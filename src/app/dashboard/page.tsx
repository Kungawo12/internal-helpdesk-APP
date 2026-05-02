"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  solution: string | null;
  createdAt: string;
  feedback?: {
    rating: number;
    comment: string | null;
  } | null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                           t.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-subtle text-xs font-medium">Syncing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dense Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Support Overview</h1>
        <Link href="/dashboard/create" className="btn-primary py-2 px-4 text-xs">
          + New Ticket
        </Link>
      </div>

      {/* Compact Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "All Tickets", value: stats.total, id: "all", color: "text-white" },
          { label: "Open", value: stats.open, id: "open", color: "text-blue-400" },
          { label: "In Progress", value: stats.inProgress, id: "in_progress", color: "text-amber-400" },
          { label: "Resolved", value: stats.resolved, id: "resolved", color: "text-emerald-400" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-4 text-left transition-all ${
              statusFilter === s.id ? "ring-1 ring-primary/50 bg-primary/5" : "hover:bg-white/[0.02]"
            }`}
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tickets by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field py-2 pl-10 text-xs"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-sm">🔍</span>
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs font-bold text-white cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Compact Ticket Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket Detail</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/dashboard/ticket/${ticket.id}`}
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{ticket.title}</p>
                    <p className="text-[10px] font-mono text-slate-600 mt-0.5">#{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{ticket.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                       ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'
                    } text-[10px] py-0.5 px-2`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      ticket.priority === 'urgent' ? 'badge-red' : 'badge-gray'
                    } text-[10px] py-0.5 px-2`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium text-slate-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.status === 'resolved' && (
                        <div className="flex text-yellow-500 text-[8px] mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={ticket.feedback && i < ticket.feedback.rating ? "opacity-100" : "opacity-10"}>★</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-subtle text-sm font-medium">No tickets found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
