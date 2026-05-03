"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";

export default function DashboardPage() {
  const router = useRouter();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }), [tickets]);

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
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Syncing manifests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-10 text-center border-danger/20 bg-danger/5">
        <div className="text-3xl mb-4">⚠️</div>
        <p className="text-danger font-bold text-lg mb-2">Sync Error</p>
        <p className="text-slate-400 text-sm mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary mx-auto"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-glow">My Tickets</h1>
          <p className="text-slate-400 text-sm font-medium">Monitoring active service requests across the network</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary px-8 py-3.5">
          <span className="text-lg">+</span> Create New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: stats.total, id: "all", color: "text-white" },
          { label: "Awaiting Action", value: stats.open, id: "open", color: "text-primary" },
          { label: "In Operation", value: stats.inProgress, id: "in_progress", color: "text-info" },
          { label: "Closed Manifest", value: stats.resolved, id: "resolved", color: "text-accent" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-6 text-left transition-all group ${
              statusFilter === s.id 
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" 
                : "hover:border-white/20"
            }`}
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-primary transition-colors" />
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-3.5 pl-12 text-sm bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-hover:opacity-100 transition-opacity">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-[20px] px-6 py-3.5 text-xs font-bold text-white cursor-pointer hover:bg-white/10 outline-none w-full sm:w-auto transition-all backdrop-blur-xl"
          >
            <option value="all" className="bg-bg-dark">All Status</option>
            <option value="open" className="bg-bg-dark">Open</option>
            <option value="in_progress" className="bg-bg-dark">Working</option>
            <option value="resolved" className="bg-bg-dark">Resolved</option>
          </select>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Ticket Details</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Classification</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">Urgency</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.02] transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base group-hover:text-primary transition-colors">
                          {ticket.title}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-600 mt-1 uppercase tracking-widest">
                          ID-{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-gray'
                      } text-[10px] py-1 px-3 font-bold`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          ticket.priority === 'urgent' || ticket.priority === 'high' ? 'bg-danger shadow-[0_0_8px_rgba(251,113,133,0.6)]' :
                          ticket.priority === 'medium' ? 'bg-warning shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-primary'
                        }`} />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          {ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-20 bg-white/[0.01]">
              <div className="text-4xl mb-4 opacity-20">📂</div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manifest Empty</p>
              <p className="text-slate-600 text-[10px] mt-1">No matching service requests found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
