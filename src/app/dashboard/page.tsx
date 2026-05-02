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
      <div className="min-h-[40vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-subtle text-sm font-bold uppercase tracking-widest animate-pulse">Syncing Protocols...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Tickets
          </h1>
          <p className="text-subtle text-sm mt-1">
            Track and manage your support requests
          </p>
        </div>
        <Link href="/dashboard/create" className="btn-primary py-2.5 px-5 text-sm">
          + New Ticket
        </Link>
      </div>

      {/* Stat Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "All Tickets", value: stats.total, id: "all", color: "text-white", icon: "📊" },
          { label: "Open", value: stats.open, id: "open", color: "text-info", icon: "⭕" },
          { label: "In Progress", value: stats.inProgress, id: "in_progress", color: "text-warning", icon: "⚡" },
          { label: "Resolved", value: stats.resolved, id: "resolved", color: "text-accent", icon: "✅" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-6 text-left relative overflow-hidden group ${
              statusFilter === s.id 
                ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5" 
                : "hover:bg-white/[0.05]"
            }`}
          >
            <div className="absolute -right-2 -bottom-2 text-4xl opacity-5 group-hover:scale-125 transition-transform grayscale">
               {s.icon}
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{s.label}</p>
            <div className="flex items-end gap-2">
              <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
              {statusFilter === s.id && <div className="w-1.5 h-1.5 rounded-full bg-primary mb-2 animate-ping" />}
            </div>
          </button>
        ))}
      </div>

      {/* Controls & Data Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-4 pl-12 font-medium"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30 grayscale">🔍</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <p className="hidden lg:block text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter</p>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white cursor-pointer hover:bg-white/10 transition-colors outline-none focus:border-primary/50 w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ticket</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Priority</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.03] transition-all cursor-pointer group relative"
                    onClick={() => window.location.href = `/dashboard/ticket/${ticket.id}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-base group-hover:text-primary transition-colors tracking-tight">
                          {ticket.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-wider">
                          UID: {ticket.id.slice(0, 12)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'
                      } text-[10px]`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`badge ${
                        ticket.priority === 'urgent' ? 'badge-red' : 
                        ticket.priority === 'high' ? 'badge-red' :
                        ticket.priority === 'medium' ? 'badge-amber' : 'badge-blue'
                      } text-[10px]`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        {ticket.status === 'resolved' && (
                          <div className="flex text-amber-400 text-[10px] bg-amber-400/5 px-2 py-0.5 rounded-full border border-amber-400/10">
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
            <div className="text-center py-24 group">
              <div className="text-5xl mb-4 grayscale opacity-20 group-hover:opacity-40 transition-opacity">📭</div>
              <p className="text-slate-500 text-sm font-black uppercase tracking-[0.3em]">No active protocols found</p>
              <p className="text-slate-600 text-[10px] font-bold mt-2 uppercase">Adjust filters or create a new ticket</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
