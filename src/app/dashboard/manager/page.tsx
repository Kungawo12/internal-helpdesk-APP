"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";

export default function ManagerDashboard() {
  const router = useRouter();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const it = tickets.filter(t => t.type === 'IT');
    const hr = tickets.filter(t => t.type === 'HR');
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      itCount: it.length,
      hrCount: hr.length,
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
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <p className="text-red-400 text-sm mb-3">Failed to load data</p>
        <button onClick={() => window.location.reload()} className="btn-primary py-2 px-4 text-xs">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="heading-prime text-2xl">Company Overview</h1>
          <p className="text-sm text-slate-400">Enterprise-wide support performance and metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Tickets", value: stats.total, color: "text-white" },
          { label: "Open Issues", value: stats.open, color: "text-primary-light" },
          { label: "In Progress", value: stats.inProgress, color: "text-info" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-400" },
          { label: "IT Volume", value: stats.itCount, color: "text-blue-400" },
          { label: "HR Volume", value: stats.hrCount, color: "text-indigo-400" },
        ].map((s, idx) => (
          <div key={idx} className="card p-4 bg-black/40">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`stat-value ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full group">
            <input
              type="text"
              placeholder="Search by title, ID, or employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-2 pl-10 text-xs"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-30">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-[11px] font-bold text-slate-300 outline-none hover:border-primary/40 transition-all cursor-pointer w-full md:w-auto"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="card bg-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Employee / Ticket</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Dept</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">
                          {ticket.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">{ticket.creator?.name}</span>
                          <span className="text-[9px] font-bold font-mono text-slate-600 uppercase">#{ticket.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          {ticket.priority}
                        </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[10px] font-bold text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTickets.length === 0 && (
            <div className="text-center py-20">
              <p className="text-sm font-bold text-white mb-1">No tickets in the system yet.</p>
              <p className="text-xs text-slate-500">Tickets will appear here once employees create them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
