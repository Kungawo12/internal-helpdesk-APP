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
      gsap.from(".prism-animate", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      });
    }
  }, [loading]);

  const stats = useMemo(() => {
    const resolved = tickets.filter(t => t.status === 'resolved');
    const totalResolutionTime = resolved.reduce((acc, t) => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      return acc + (updated - created);
    }, 0);
    const avgResTime = resolved.length > 0 ? (totalResolutionTime / resolved.length / (1000 * 60 * 60)).toFixed(1) : "0";

    const feedbackTickets = tickets.filter(t => t.feedback?.rating);
    const avgSatisfaction = feedbackTickets.length > 0 
      ? (feedbackTickets.reduce((acc, t) => acc + (t.feedback?.rating || 0), 0) / feedbackTickets.length).toFixed(1)
      : "0";

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolvedCount: resolved.length,
      itCount: tickets.filter(t => t.type === 'IT').length,
      hrCount: tickets.filter(t => t.type === 'HR').length,
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
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-16 h-16 border-[4px] border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Compiling Global Intelligence</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="prism-bg">
        <div className="prism-mesh" />
        <div 
          className="prism-wallpaper" 
          style={{ backgroundImage: 'url("/images/executive_data_analytics_bg.png")' }} 
        />
      </div>
      
      {/* Prism Header */}
      <div className="prism-animate flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="badge-prism bg-blue-50 text-blue-600 border border-blue-100">Executive Dashboard</span>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-5xl font-extrabold text-[#0f172a] tracking-tight">System Oversight</h1>
          <p className="text-lg text-[#475569] font-medium">Global operational metrics and department health analysis</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="glass-panel px-6 py-3 border-emerald-100 bg-emerald-50/30 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Service_Active</span>
           </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Volume", value: stats.total, icon: "📊", color: "text-slate-900" },
          { label: "Open Issues", value: stats.open, icon: "⚡", color: "text-amber-600" },
          { label: "In Production", value: stats.inProgress, icon: "⚙️", color: "text-blue-600" },
          { label: "Resolved", value: stats.resolvedCount, icon: "✅", color: "text-emerald-600" },
          { label: "Avg Resolution", value: `${stats.avgResTime}h`, icon: "⏱️", color: "text-indigo-600" },
          { label: "CSAT Score", value: `${stats.avgSatisfaction}/5`, icon: "⭐", color: "text-blue-600" },
        ].map((kpi, idx) => (
          <div key={idx} className="prism-animate glass-panel p-6 hover:!bg-white shadow-sm border-white/50">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
             <div className="flex items-center justify-between">
                <span className={`text-3xl font-extrabold ${kpi.color} tracking-tighter`}>{kpi.value}</span>
                <span className="text-xl opacity-20 grayscale">{kpi.icon}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume Analysis */}
        <div className="prism-animate glass-panel p-8 bg-white/40 space-y-10">
           <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em]">Volume_Distribution_Logic</h3>
           
           <div className="space-y-8">
              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-extrabold text-blue-600">IT Infrastructure</span>
                    <span className="text-lg font-black text-[#0f172a]">{stats.itCount} <span className="text-[10px] text-slate-400">PTS</span></span>
                 </div>
                 <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000" style={{ width: `${(stats.itCount / (stats.total || 1)) * 100}%` }} />
                 </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <span className="text-sm font-extrabold text-indigo-600">HR Operations</span>
                    <span className="text-lg font-black text-[#0f172a]">{stats.hrCount} <span className="text-[10px] text-slate-400">PTS</span></span>
                 </div>
                 <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-1000" style={{ width: `${(stats.hrCount / (stats.total || 1)) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-12">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resource Efficiency</p>
                 <p className="text-3xl font-extrabold text-[#0f172a] tracking-tighter">94.2%</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SLA Achievement</p>
                 <p className="text-3xl font-extrabold text-[#0f172a] tracking-tighter">88.5%</p>
              </div>
           </div>
        </div>

        {/* Priority Matrix */}
        <div className="prism-animate glass-panel p-8 bg-white/40">
           <h3 className="text-xs font-black text-[#0f172a] uppercase tracking-[0.2em] mb-10">Priority_Response_Matrix</h3>
           
           <div className="flex items-end justify-between h-48 gap-6 px-4">
              {[
                { label: "Low", value: stats.priority.low, color: "bg-slate-200", text: "text-slate-400" },
                { label: "Med", value: stats.priority.medium, color: "bg-blue-400", text: "text-blue-600" },
                { label: "High", value: stats.priority.high, color: "bg-amber-400", text: "text-amber-600" },
                { label: "Urgent", value: stats.priority.urgent, color: "bg-red-400", text: "text-red-600" },
              ].map((p, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-6 group">
                   <div className="relative w-full flex items-end justify-center">
                      <div className={`w-full rounded-t-xl transition-all duration-1000 group-hover:brightness-110 shadow-lg ${p.color}`}
                        style={{ height: `${(p.value / (stats.total || 1)) * 100}%`, minHeight: '12px' }}
                      />
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${p.text}`}>{p.label}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Data Manifest Container */}
      <div className="prism-animate space-y-6">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search global manifest by title, ID, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-prism w-full pl-12 h-14 bg-white/60"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-prism w-full lg:w-64 h-14 cursor-pointer font-black text-[11px] uppercase tracking-widest bg-white/60"
          >
            <option value="all">Global Manifest</option>
            <option value="open">Open Requests</option>
            <option value="in_progress">In Production</option>
            <option value="resolved">Finalized</option>
          </select>
        </div>

        <div className="glass-panel bg-white/40 border-white/50 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee / Subject</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/60 transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#0f172a] text-lg group-hover:text-blue-600 transition-colors tracking-tight">
                          {ticket.title}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{ticket.creator?.name}</span>
                          <span className="text-[10px] font-black font-mono text-slate-300">#ID_{ticket.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase border border-blue-100 shadow-sm">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`badge-prism ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[11px] font-black uppercase tracking-widest ${
                         ticket.priority === 'urgent' ? 'text-red-500' :
                         ticket.priority === 'high' ? 'text-amber-500' : 'text-slate-400'
                       }`}>
                          {ticket.priority}
                        </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-32 bg-white/40">
              <div className="text-6xl mb-6">🏢</div>
              <h3 className="text-2xl font-extrabold text-[#0f172a] uppercase tracking-widest">No Manifest Data</h3>
              <p className="text-slate-500 font-medium">The enterprise service manifest is currently clear.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
