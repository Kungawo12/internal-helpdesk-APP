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
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Syncing Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center border-red-500/20 bg-red-500/5">
        <h2 className="text-sm font-bold text-white mb-1">Connection Error</h2>
        <p className="text-[11px] text-slate-400 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary py-1.5 px-4 mx-auto text-xs">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h1 className="heading-prime">My Tickets</h1>
          <p className="text-[11px] text-slate-500 font-medium">Monitoring active service requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          + New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: stats.total, id: "all", color: "text-white" },
          { label: "Open", value: stats.open, id: "open", color: "text-primary-light" },
          { label: "In Progress", value: stats.inProgress, id: "in_progress", color: "text-info" },
          { label: "Resolved", value: stats.resolved, id: "resolved", color: "text-emerald-400" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-3.5 text-left transition-all ${
              statusFilter === s.id ? "ring-1 ring-primary/40 bg-primary/5" : "bg-black/40 hover:bg-black/60"
            }`}
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`stat-value ${s.color} mb-2`}>{s.value}</p>
            <div className="progress-bar-container">
              <div 
                className={`progress-bar-fill ${s.color.replace("text-", "bg-")}`} 
                style={{ width: `${Math.min((s.value / (stats.total || 1)) * 100, 100)}%` }} 
              />
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-1.5 pl-9 text-xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-30">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-300 outline-none hover:border-primary/40 transition-all cursor-pointer"
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
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Dept</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">SLA Health</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.03] transition-all cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">
                          {ticket.title}
                        </span>
                        <span className="text-[9px] font-bold font-mono text-slate-600 mt-0.5 uppercase">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-slate-400">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                         <div className={`w-1.5 h-1.5 rounded-full ${
                           ticket.priority === 'urgent' || ticket.priority === 'high' ? 'bg-red-500' :
                           ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-primary'
                         }`} />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          {ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[100px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500">
                          <span>SLA</span>
                          <span>{ticket.status === 'resolved' ? '100%' : '65%'}</span>
                        </div>
                        <div className="progress-bar-container">
                          <div 
                            className={`progress-bar-fill ${
                              ticket.status === 'resolved' ? 'bg-emerald-500' : 
                              ticket.priority === 'urgent' ? 'bg-red-500' : 'bg-primary'
                            }`} 
                            style={{ width: ticket.status === 'resolved' ? '100%' : '65%' }} 
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
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
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 text-2xl">
                📝
              </div>
              <p className="text-sm font-bold text-white mb-1">No tickets yet</p>
              <p className="text-xs text-slate-500 mb-6">Create your first ticket to get started with our support team.</p>
              <Link href="/dashboard/create" className="btn-primary inline-flex">
                + Create Your First Ticket
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
