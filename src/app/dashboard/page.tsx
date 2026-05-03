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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Fetching data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 text-center border-red-100 bg-red-50/30">
        <div className="text-4xl mb-4">📡</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Interrupted</h2>
        <p className="text-slate-600 text-sm mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary mx-auto"
        >
          Refresh Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-1">
          <p className="text-primary font-bold text-xs uppercase tracking-widest mb-1">Service Control</p>
          <h1 className="heading-prime">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time status of your active support requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary px-8 h-12">
          New Request
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Tickets", value: stats.total, id: "all", icon: "📑" },
          { label: "Open Now", value: stats.open, id: "open", icon: "🔘" },
          { label: "Processing", value: stats.inProgress, id: "in_progress", icon: "⏳" },
          { label: "Completed", value: stats.resolved, id: "resolved", icon: "✅" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-6 text-left transition-all ${
              statusFilter === s.id 
                ? "ring-2 ring-primary bg-white shadow-lg" 
                : "bg-white/60 hover:bg-white"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
               <span className="text-xl">{s.icon}</span>
               <div className={`w-2 h-2 rounded-full ${statusFilter === s.id ? "bg-primary animate-pulse" : "bg-slate-200"}`} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="stat-value text-slate-900">{s.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
            <input
              type="text"
              placeholder="Filter by title or reference ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-3 pl-12 text-sm shadow-sm"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-6 py-3 text-xs font-bold text-slate-700 cursor-pointer hover:border-primary outline-none w-full sm:w-auto transition-all shadow-sm"
          >
            <option value="all">All Entries</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="card shadow-sm border-slate-200/60 bg-white/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Reference</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Current Status</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">
                          {ticket.title}
                        </span>
                        <span className="text-[10px] font-bold font-mono text-slate-400 mt-1 uppercase">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           ticket.priority === 'urgent' || ticket.priority === 'high' ? 'bg-red-500' :
                           ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                         }`} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-24">
              <p className="text-slate-400 text-sm font-medium italic">No entries found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
