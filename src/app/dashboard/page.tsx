"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";
import gsap from "gsap";

export default function DashboardPage() {
  const router = useRouter();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Entrance Animation
  useEffect(() => {
    if (!loading) {
      gsap.from(".animate-item", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }
  }, [loading]);

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
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton" />
            <div className="h-4 w-64 skeleton" />
          </div>
          <div className="h-10 w-32 skeleton" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 glass-card skeleton" />)}
        </div>
        <div className="h-96 glass-card skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-white mb-2">Service Offline</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-premium bg-red-600">
          Re-initialize Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="animate-item flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="heading-prime text-4xl">Command Center</h1>
          <p className="text-slate-400 font-medium tracking-tight">Real-time service request monitor</p>
        </div>
        <Link href="/dashboard/create" className="btn-premium group">
          <span className="flex items-center gap-2">
            <span>New Ticket</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Load", value: stats.total, icon: "📊", id: "all", color: "from-blue-500/20" },
          { label: "Active", value: stats.open, icon: "⚡", id: "open", color: "from-amber-500/20" },
          { label: "Processing", value: stats.inProgress, icon: "⚙️", id: "in_progress", color: "from-primary/20" },
          { label: "Completed", value: stats.resolved, icon: "✅", id: "resolved", color: "from-emerald-500/20" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`animate-item glass-card p-5 text-left group hover:scale-[1.02] active:scale-[0.98] ${
              statusFilter === s.id ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(14,165,233,0.15)]" : ""
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl">{s.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">System_Metric</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{s.value}</span>
                <span className="text-[10px] text-slate-600 font-bold">PTS</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="animate-item glass-card bg-black/40 border-white/5">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search data-feed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30 text-sm">🔍</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-2">Filter_By:</span>
            {['all', 'open', 'in_progress', 'resolved'].map(f => (
               <button 
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-slate-500 hover:text-slate-300"
                }`}
               >
                 {f}
               </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Service_Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Category</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status_State</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Priority</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTickets.map((ticket, idx) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-white/[0.03] transition-all cursor-pointer group animate-item"
                  onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                        {ticket.type === 'IT' ? '💻' : '📋'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-base group-hover:text-primary transition-colors tracking-tight">
                          {ticket.title}
                        </span>
                        <span className="text-[10px] font-black font-mono text-slate-600 mt-0.5 tracking-widest uppercase">
                          ID: {ticket.id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[11px] font-black text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                      {ticket.type}_DEPT
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                         ticket.status === 'resolved' ? 'bg-emerald-500' : 
                         ticket.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'
                       }`} />
                       <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                         ticket.status === 'resolved' ? 'text-emerald-400' : 
                         ticket.status === 'in_progress' ? 'text-blue-400' : 'text-amber-400'
                       }`}>
                         {ticket.status.replace("_", " ")}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        <span>P: {ticket.priority}</span>
                        <span>75%</span>
                      </div>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${
                           ticket.priority === 'urgent' ? 'bg-red-500' :
                           ticket.priority === 'high' ? 'bg-amber-500' : 'bg-primary'
                        }`} style={{ width: '75%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-24 group">
            <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-6 border border-white/5 text-3xl group-hover:scale-110 transition-transform duration-500">
              🛰️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Uplink Data</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Your service manifest is currently clear. No active transmissions detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
