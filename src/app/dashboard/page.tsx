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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading your tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center max-w-md mx-auto">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">⚠️</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary w-full">Retry Connection</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-prime">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your active and past support requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          + Create New Ticket
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "All Tickets", value: stats.total, color: "text-slate-900", bg: "bg-white" },
          { label: "Open", value: stats.open, color: "text-amber-600", bg: "bg-white" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-600", bg: "bg-white" },
          { label: "Resolved", value: stats.resolved, color: "text-green-600", bg: "bg-white" },
        ].map((s, idx) => (
          <div key={idx} className={`card p-5 ${s.bg}`}>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main List */}
      <div className="card bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title or ticket ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field w-full pl-10"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {['all', 'open', 'in_progress', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === f ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
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
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {ticket.title}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">
                        #{ticket.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-600 font-medium px-2 py-1 bg-slate-100 rounded-md">{ticket.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      ticket.status === 'resolved' ? 'badge-green' : 
                      ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                    }`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${
                      ticket.priority === 'urgent' ? 'text-red-600' :
                      ticket.priority === 'high' ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-500 font-medium">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-24 text-center">
             <div className="text-4xl mb-4">📝</div>
            <p className="text-slate-900 font-bold mb-1">No tickets yet</p>
            <p className="text-slate-500 text-sm mb-6">Create your first ticket to get started with our support team.</p>
            <Link href="/dashboard/create" className="btn-primary">
              + Create Your First Ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
