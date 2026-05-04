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
      itOpen: tickets.filter(t => t.type === 'IT' && t.status === 'open').length,
      hrOpen: tickets.filter(t => t.type === 'HR' && t.status === 'open').length,
      itResolved: tickets.filter(t => t.type === 'IT' && t.status === 'resolved').length,
      hrResolved: tickets.filter(t => t.type === 'HR' && t.status === 'resolved').length,
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

  const recentTickets = useMemo(() => {
    return [...tickets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [tickets]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">Something went wrong. Try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue">Manager</span>
            <span className="text-xs text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl font-bold">Welcome back, {session?.user?.name || "Manager"}</h1>
          <p className="text-sm text-slate-500">Company Overview</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Tickets", value: stats.total, color: "text-slate-900" },
          { label: "Open", value: stats.open, color: "text-slate-900" },
          { label: "In Progress", value: stats.inProgress, color: "text-amber-600" },
          { label: "Resolved", value: stats.resolvedCount, color: "text-green-600" },
          { label: "Avg Res Time (h)", value: stats.avgResTime, color: "text-blue-600" },
          { label: "Satisfaction", value: `${stats.avgSatisfaction}/5`, color: "text-blue-600" },
        ].map((kpi, idx) => (
          <div key={idx} className="card p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">{kpi.label}</p>
            <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold">Volume by Department</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>IT Department</span>
                <span className="font-semibold">{stats.itCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(stats.itCount / (stats.total || 1)) * 100}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>HR Department</span>
                <span className="font-semibold">{stats.hrCount}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(stats.hrCount / (stats.total || 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold">Priority Breakdown</h3>
          <div className="flex items-end h-20 gap-2">
             {[
                { label: "Low", value: stats.priority.low, color: "bg-slate-300" },
                { label: "Med", value: stats.priority.medium, color: "bg-blue-400" },
                { label: "High", value: stats.priority.high, color: "bg-amber-400" },
                { label: "Urgent", value: stats.priority.urgent, color: "bg-red-500" },
             ].map((p, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                   <div className={`w-full rounded-t-sm ${p.color}`} style={{ height: `${(p.value / (stats.total || 1)) * 100}%`, minHeight: '4px' }}></div>
                   <span className="text-[10px] text-slate-500">{p.label} ({p.value})</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold">Department Performance</h3>
          <div className="grid grid-cols-2 gap-4">
             <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                <p className="text-xs font-semibold text-blue-600 mb-2">IT Operations</p>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Open</span><span className="font-semibold">{stats.itOpen}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Resolved</span><span className="font-semibold">{stats.itResolved}</span></div>
             </div>
             <div className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                <p className="text-xs font-semibold text-indigo-600 mb-2">HR Operations</p>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Open</span><span className="font-semibold">{stats.hrOpen}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Resolved</span><span className="font-semibold">{stats.hrResolved}</span></div>
             </div>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          <div className="space-y-2">
             {recentTickets.map(t => (
                <div key={t.id} onClick={() => router.push(`/dashboard/ticket/${t.id}`)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
                   <div className="flex flex-col">
                      <span className="text-xs font-semibold truncate max-w-[200px]">{t.title}</span>
                      <span className="text-[10px] text-slate-500">{t.creator?.name}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className={`badge ${t.status === 'resolved' ? 'badge-green' : t.status === 'in_progress' ? 'badge-amber' : 'badge-slate'}`}>{t.status.replace("_", " ")}</span>
                      <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-sm"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-[200px]"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase">Ticket</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase">Dept</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase">Priority</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">{ticket.title}</span>
                      <span className="text-xs text-slate-500">{ticket.creator?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-slate">{ticket.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                        ticket.status === 'resolved' ? 'badge-green' : 
                        ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'
                    }`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                     <span className={`text-xs ${
                        ticket.priority === 'urgent' ? 'text-red-600 font-semibold' :
                        ticket.priority === 'high' ? 'text-amber-600' : 'text-slate-500'
                     }`}>
                        {ticket.priority}
                      </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
