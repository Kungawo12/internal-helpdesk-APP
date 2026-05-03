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
        <div className="w-16 h-16 border-[6px] border-primary border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(56,189,248,0.2)]" />
        <p className="text-white text-xs font-black uppercase tracking-[0.3em] animate-pulse">Syncing Network Manifest...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-16 text-center border-danger/30 bg-danger/10 backdrop-blur-3xl">
        <div className="text-6xl mb-6 animate-bounce">📡</div>
        <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">Connection Dropped</h2>
        <p className="text-slate-300 text-sm mb-10 font-medium max-w-md mx-auto leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary mx-auto h-14 px-12 text-base shadow-[0_0_30px_rgba(56,189,248,0.4)]"
        >
          Initialize Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Operations</span>
          </div>
          <h1 className="heading-prime text-glow">Dashboard</h1>
          <p className="text-slate-300 text-lg font-medium tracking-tight">Monitoring real-time service requests across the enterprise.</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary px-12 h-16 text-lg shadow-[0_15px_40px_rgba(56,189,248,0.3)]">
          <span className="text-2xl">+</span> Create Report
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Active Tickets", value: stats.total, id: "all", icon: "📑", color: "text-white" },
          { label: "Awaiting Action", value: stats.open, id: "open", icon: "🔘", color: "text-primary" },
          { label: "In Operation", value: stats.inProgress, id: "in_progress", icon: "⏳", color: "text-info" },
          { label: "Closed Manifest", value: stats.resolved, id: "resolved", icon: "✅", color: "text-accent" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-8 text-left transition-all relative group ${
              statusFilter === s.id 
                ? "ring-2 ring-primary bg-black/80 shadow-[0_20px_60px_rgba(0,0,0,0.4)] scale-[1.02]" 
                : "bg-black/40 hover:bg-black/60"
            }`}
          >
            <div className="flex justify-between items-start mb-6">
               <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{s.icon}</span>
               <div className={`w-2 h-2 rounded-full transition-all duration-500 ${statusFilter === s.id ? "bg-primary shadow-[0_0_15px_rgba(56,189,248,1)] scale-150" : "bg-white/10"}`} />
            </div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 group-hover:text-primary transition-colors">{s.label}</p>
            <p className={`stat-value transition-all duration-500 ${s.color} ${statusFilter === s.id ? "scale-110 translate-x-1" : ""}`}>{s.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-1 w-full group">
            <input
              type="text"
              placeholder="Filter manifest by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-5 pl-14 text-base bg-black/20 group-hover:bg-black/40 border-white/5 group-hover:border-white/20 transition-all placeholder:text-slate-600"
            />
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-20 group-hover:opacity-100 transition-all">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-[24px] px-8 py-5 text-xs font-black text-white cursor-pointer hover:bg-black/60 outline-none w-full sm:w-auto transition-all backdrop-blur-3xl uppercase tracking-widest shadow-xl"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">Working</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="card border-white/5 bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Service Reference</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Urgency</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">
                          {ticket.title}
                        </span>
                        <span className="text-[10px] font-black font-mono text-slate-600 mt-1 uppercase tracking-[0.2em]">
                          ID-{ticket.id.slice(0, 10)}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[10px] font-black text-slate-400 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-widest">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      } text-[10px] py-1.5 px-4 font-black`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${
                           ticket.priority === 'urgent' || ticket.priority === 'high' ? 'bg-danger animate-pulse' :
                           ticket.priority === 'medium' ? 'bg-warning' : 'bg-primary'
                         }`} />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-32 opacity-30">
              <div className="text-6xl mb-6">📂</div>
              <p className="text-white text-sm font-black uppercase tracking-[0.4em]">Manifest Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
