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
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-xs font-medium">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center border-danger/20 bg-danger/5">
        <p className="text-danger font-bold">Failed to load tickets</p>
        <p className="text-slate-500 text-xs mt-1">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-xs font-bold text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Tickets</h1>
          <p className="text-slate-500 text-xs mt-1">Track and manage your support requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary py-2 px-4 text-xs">
          + Create Ticket
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, id: "all", color: "text-white" },
          { label: "Open", value: stats.open, id: "open", color: "text-blue-400" },
          { label: "In Progress", value: stats.inProgress, id: "in_progress", color: "text-amber-400" },
          { label: "Resolved", value: stats.resolved, id: "resolved", color: "text-emerald-400" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setStatusFilter(s.id)}
            className={`card p-4 text-left transition-all ${
              statusFilter === s.id 
                ? "bg-white/[0.06] border-white/20" 
                : "bg-white/[0.01] border-white/5 hover:bg-white/[0.04]"
            }`}
          >
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-1.5 pl-9 text-xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white cursor-pointer hover:bg-white/10 outline-none w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Ticket</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs group-hover:text-primary transition-colors">
                          {ticket.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 mt-0.5">
                          #{ticket.id.slice(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                         ticket.status === 'resolved' ? 'badge-green' : 
                         ticket.status === 'in_progress' ? 'badge-blue' : 'badge-gray'
                      } text-[11px] py-0.5 px-2`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        ticket.priority === 'urgent' ? 'badge-red' : 
                        ticket.priority === 'high' ? 'badge-red' :
                        ticket.priority === 'medium' ? 'badge-amber' : 'badge-blue'
                      } text-[11px] py-0.5 px-2`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[11px] font-medium text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-xs font-medium">No tickets found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
