"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { useSession } from "next-auth/react";

export default function ManagerDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const resolved = tickets.filter(t => t.status === 'resolved');
    const it = tickets.filter(t => t.type === 'IT');
    const hr = tickets.filter(t => t.type === 'HR');

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
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-8 h-80">
          <div className="bg-white border border-slate-200 rounded-xl" />
          <div className="bg-white border border-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Executive Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
              Company Overview
            </span>
            <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="heading-prime">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-slate-500 mt-1">Global oversight and performance metrics for all departments</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Service Online
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Tickets", value: stats.total, icon: "📊", color: "text-slate-900" },
          { label: "Open Issues", value: stats.open, icon: "⚡", color: "text-amber-600" },
          { label: "Processing", value: stats.inProgress, icon: "⚙️", color: "text-blue-600" },
          { label: "Resolved", value: stats.resolvedCount, icon: "✅", color: "text-green-600" },
          { label: "Avg Speed", value: `${stats.avgResTime}h`, icon: "⏱️", color: "text-indigo-600" },
          { label: "CSAT Score", value: `${stats.avgSatisfaction}/5`, icon: "⭐", color: "text-blue-600" },
        ].map((kpi, idx) => (
          <div key={idx} className="card p-5">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
             <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</span>
                <span className="text-xl opacity-30">{kpi.icon}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Analytics Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Volume */}
        <div className="card p-6 space-y-8 bg-white">
           <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider">Volume Distribution</h3>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-blue-600">IT Department</span>
                    <span className="text-slate-900">{stats.itCount} tickets</span>
                 </div>
                 <div className="progress-container h-3 bg-slate-100">
                    <div className="progress-fill bg-blue-600" style={{ width: `${(stats.itCount / (stats.total || 1)) * 100}%` }} />
                 </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-indigo-600">HR Department</span>
                    <span className="text-slate-900">{stats.hrCount} tickets</span>
                 </div>
                 <div className="progress-container h-3 bg-slate-100">
                    <div className="progress-fill bg-indigo-600" style={{ width: `${(stats.hrCount / (stats.total || 1)) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-8">
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IT Efficiency</p>
                 <p className="text-xl font-bold text-slate-900">94.2%</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">HR SLA Rate</p>
                 <p className="text-xl font-bold text-slate-900">88.5%</p>
              </div>
           </div>
        </div>

        {/* Priority Analysis */}
        <div className="card p-6 bg-white">
           <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-8">Priority Distribution</h3>
           
           <div className="flex items-end justify-between h-44 gap-4 px-4">
              {[
                { label: "Low", value: stats.priority.low, color: "bg-slate-200", text: "text-slate-500" },
                { label: "Med", value: stats.priority.medium, color: "bg-blue-400", text: "text-blue-600" },
                { label: "High", value: stats.priority.high, color: "bg-amber-400", text: "text-amber-600" },
                { label: "Urgent", value: stats.priority.urgent, color: "bg-red-400", text: "text-red-600" },
              ].map((p, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4">
                   <div className="relative w-full flex items-end justify-center">
                      <div className={`w-full rounded-t-lg transition-all duration-1000 bg-opacity-80 ${p.color}`}
                        style={{ height: `${(p.value / (stats.total || 1)) * 100}%`, minHeight: '8px' }}
                      />
                   </div>
                   <span className={`text-[10px] font-bold uppercase tracking-wider ${p.text}`}>{p.label}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Main Ticket Manifest */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Filter by title, ID or employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-full md:w-48 cursor-pointer font-semibold text-xs uppercase"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Issues</option>
            <option value="in_progress">Working</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="card bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee / Ticket</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dept</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                          {ticket.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{ticket.creator?.name}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-300">#{ticket.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md uppercase">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${
                         ticket.priority === 'urgent' ? 'text-red-600' :
                         ticket.priority === 'high' ? 'text-amber-600' : 'text-slate-500'
                       }`}>
                          {ticket.priority}
                        </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-[11px] font-medium text-slate-500 font-mono">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-24 bg-white">
              <div className="text-4xl mb-4">🏢</div>
              <p className="text-slate-900 font-bold mb-1 uppercase tracking-widest">No active system data</p>
              <p className="text-slate-500 text-sm">The enterprise service manifest is currently clear.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
