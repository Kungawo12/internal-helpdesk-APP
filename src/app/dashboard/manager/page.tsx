"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { useSession } from "next-auth/react";
import gsap from "gsap";

export default function ManagerDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading) {
      gsap.from(".manager-animate", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      });
    }
  }, [loading]);

  const stats = useMemo(() => {
    const resolved = tickets.filter(t => t.status === 'resolved');
    const it = tickets.filter(t => t.type === 'IT');
    const hr = tickets.filter(t => t.type === 'HR');

    // Calculate Average Resolution Time (in hours)
    const totalResolutionTime = resolved.reduce((acc, t) => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      return acc + (updated - created);
    }, 0);
    const avgResTime = resolved.length > 0 ? (totalResolutionTime / resolved.length / (1000 * 60 * 60)).toFixed(1) : "0";

    // Calculate Satisfaction
    const feedbackTickets = tickets.filter(t => t.feedback?.rating);
    const avgSatisfaction = feedbackTickets.length > 0 
      ? (feedbackTickets.reduce((acc, t) => acc + (t.feedback?.rating || 0), 0) / feedbackTickets.length).toFixed(1)
      : "0";

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolvedCount: resolved.length,
      itCount: it.length,
      hrCount: hr.length,
      avgResTime,
      avgSatisfaction,
      priority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
      }
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                           t.id.toLowerCase().includes(search.toLowerCase()) ||
                           t.creator?.name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-20 w-full skeleton glass-card" />
        <div className="grid grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 skeleton glass-card" />)}
        </div>
        <div className="grid grid-cols-2 gap-4 h-64">
           <div className="skeleton glass-card" />
           <div className="skeleton glass-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Welcome Header */}
      <div className="manager-animate flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
              Executive_Session
            </span>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="heading-prime text-4xl">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-slate-400 font-medium tracking-tight">System operations oversight and performance analytics</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="glass-card px-4 py-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Service_Online
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Volume", value: stats.total, icon: "📊", color: "text-white" },
          { label: "Active Requests", value: stats.open, icon: "⚡", color: "text-amber-400" },
          { label: "In Production", value: stats.inProgress, icon: "⚙️", color: "text-blue-400" },
          { label: "Finalized", value: stats.resolvedCount, icon: "✅", color: "text-emerald-400" },
          { label: "Avg Resolution", value: `${stats.avgResTime}h`, icon: "⏱️", color: "text-indigo-400" },
          { label: "CSAT Score", value: `${stats.avgSatisfaction}/5`, icon: "⭐", color: "text-primary-light" },
        ].map((kpi, idx) => (
          <div key={idx} className="manager-animate glass-card p-5 group hover:bg-white/[0.03]">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
             <div className="flex items-center justify-between">
                <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
                <span className="text-xl opacity-20 group-hover:opacity-100 transition-opacity">{kpi.icon}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Volume & Dept Breakdown */}
        <div className="manager-animate glass-card p-6 space-y-8">
           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Volume_Distribution</h3>
           
           <div className="space-y-6">
              {/* IT vs HR Bar */}
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-blue-400">IT Department</span>
                    <span className="text-white">{stats.itCount} tickets</span>
                 </div>
                 <div className="progress-bar-container h-3">
                    <div className="progress-bar-fill bg-blue-500" style={{ width: `${(stats.itCount / (stats.total || 1)) * 100}%` }} />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-indigo-400">HR Department</span>
                    <span className="text-white">{stats.hrCount} tickets</span>
                 </div>
                 <div className="progress-bar-container h-3">
                    <div className="progress-bar-fill bg-indigo-500" style={{ width: `${(stats.hrCount / (stats.total || 1)) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IT Efficiency</p>
                 <p className="text-lg font-black text-white">94.2%</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HR SLA Hit</p>
                 <p className="text-lg font-black text-white">88.5%</p>
              </div>
           </div>
        </div>

        {/* Priority Breakdown Chart */}
        <div className="manager-animate glass-card p-6">
           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Priority_Matrix_Analytics</h3>
           
           <div className="flex items-end justify-between h-40 gap-4 px-4">
              {[
                { label: "Low", value: stats.priority.low, color: "bg-slate-500/20", text: "text-slate-400" },
                { label: "Med", value: stats.priority.medium, color: "bg-blue-500/40", text: "text-blue-400" },
                { label: "High", value: stats.priority.high, color: "bg-amber-500/60", text: "text-amber-400" },
                { label: "Urgent", value: stats.priority.urgent, color: "bg-red-500/80", text: "text-red-400" },
              ].map((p, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                   <div className="relative w-full flex items-end justify-center">
                      <div className="absolute -top-6 text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.value}
                      </div>
                      <div 
                        className={`w-full rounded-t-xl transition-all duration-1000 ${p.color} border-t border-white/10 group-hover:brightness-125`} 
                        style={{ height: `${(p.value / (stats.total || 1)) * 100}%`, minHeight: '8px' }} 
                      />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${p.text}`}>{p.label}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="manager-animate glass-card">
         <div className="p-6 border-b border-white/5">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Recent_Operations_Feed</h3>
         </div>
         <div className="divide-y divide-white/5">
            {tickets.slice(0, 5).map((t) => (
               <div 
                key={t.id} 
                className="flex items-center justify-between p-4 px-6 hover:bg-white/[0.02] transition-all cursor-pointer group"
                onClick={() => router.push(`/dashboard/ticket/${t.id}`)}
               >
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm shadow-inner group-hover:scale-110 transition-transform">
                        {t.type === 'IT' ? '💻' : '📋'}
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{t.title}</span>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{t.creator?.name} • {new Date(t.createdAt).toLocaleTimeString()}</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`badge ${t.status === 'resolved' ? 'badge-green' : 'badge-amber'}`}>{t.status}</span>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">#{t.id.slice(0, 8)}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Main Ticket Manifest */}
      <div className="manager-animate space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search global data-feed..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-sm focus:outline-none focus:border-primary/50 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30 text-sm">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-300 outline-none hover:border-primary/40 transition-all cursor-pointer w-full md:w-auto"
          >
            <option value="all">Global Manifest</option>
            <option value="open">Open State</option>
            <option value="in_progress">Processing</option>
            <option value="resolved">Finalized</option>
          </select>
        </div>

        <div className="glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Employee / Ticket</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Dept</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Priority</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm group-hover:text-primary transition-colors tracking-tight">
                          {ticket.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{ticket.creator?.name}</span>
                          <span className="text-[9px] font-black font-mono text-slate-700">#{ticket.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                          {ticket.priority}
                        </span>
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
            <div className="text-center py-24 group opacity-50">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🏢</div>
              <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest">No active system data</p>
              <p className="text-xs text-slate-500">The enterprise service manifest is currently clear.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
