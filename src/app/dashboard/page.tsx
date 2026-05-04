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
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading your tickets...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-xl font-bold">My Tickets</h1>
          <p className="text-sm text-slate-500">Manage and track your support requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          New Ticket
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Tickets", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "In Progress", value: stats.inProgress },
          { label: "Resolved", value: stats.resolved },
        ].map((s, idx) => (
          <div key={idx} className="card p-3">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">{s.label}</p>
            <p className="text-xl font-bold mt-1 text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main List Container */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field sm:max-w-[200px]"
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
                <th className="px-4 py-2 text-[11px] font-semibold text-slate-500 uppercase text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">{ticket.title}</span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">#{ticket.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-slate">{ticket.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      ticket.status === 'resolved' ? 'badge-green' : 
                      ticket.status === 'in_progress' ? 'badge-amber' : 'badge-blue'
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
                  <td className="px-4 py-3 text-right text-xs text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && tickets.length > 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">No tickets match your search.</p>
          </div>
        )}

        {tickets.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4 text-slate-300">🎫</div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tickets yet</h3>
            <p className="text-sm text-slate-500 mb-6">Create your first ticket to get started.</p>
            <Link href="/dashboard/create" className="btn-primary">
              Create Ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
