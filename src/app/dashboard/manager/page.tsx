"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";

export default function ManagerDashboard() {
  const router = useRouter();
  const { tickets, loading, error } = useTickets();
  const [filter, setFilter] = useState({ status: "all", type: "all" });
  const [search, setSearch] = useState("");

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    it: tickets.filter((t) => t.type === "IT").length,
    hr: tickets.filter((t) => t.type === "HR").length,
  }), [tickets]);

  const filteredTickets = useMemo(() => tickets.filter((t) => {
    const matchesStatus = filter.status === "all" || t.status === filter.status;
    const matchesType = filter.type === "all" || t.type === filter.type;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                         t.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  }), [tickets, filter, search]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-xs font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Company Overview</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time overview of all support tickets</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Open", value: stats.open },
          { label: "In Progress", value: stats.inProgress },
          { label: "Resolved", value: stats.resolved },
          { label: "IT Dept", value: stats.it },
          { label: "HR Dept", value: stats.hr },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 bg-white/[0.01]">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field py-1.5 pl-9 text-xs"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-xs">🔍</span>
          </div>
          <div className="flex gap-2">
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white cursor-pointer hover:bg-white/10 outline-none"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-white cursor-pointer hover:bg-white/10 outline-none"
            >
              <option value="all">All Types</option>
              <option value="IT">IT Support</option>
              <option value="HR">HR Support</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Ticket</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Creator</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Dept</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Date</th>
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
                      <span className="font-bold text-white text-xs group-hover:text-primary transition-colors">{ticket.title}</span>
                      <span className="text-[11px] font-mono text-slate-600 mt-0.5">#{ticket.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300 font-medium">{ticket.creator.name}</td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">{ticket.type}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                       ticket.status === 'resolved' ? 'badge-green' : 
                       ticket.status === 'in_progress' ? 'badge-blue' : 'badge-gray'
                    } text-[11px] py-0.5 px-2`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[11px] text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-xs font-medium">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
