"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: { name: string; email: string };
  assignee: { name: string; email: string } | null;
  feedback: { rating: number } | null;
};

export default function ManagerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", type: "all" });

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      });
  }, []);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    it: tickets.filter((t) => t.type === "IT").length,
    hr: tickets.filter((t) => t.type === "HR").length,
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter.status !== "all" && t.status !== filter.status) return false;
    if (filter.type !== "all" && t.type !== filter.type) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Manager Overview</h1>
        <p className="text-slate-400 mt-1">
          Company-wide ticket status and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Open", value: stats.open, color: "text-blue-400" },
          { label: "In Progress", value: stats.inProgress, color: "text-yellow-400" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-400" },
          { label: "IT Tickets", value: stats.it, color: "text-cyan-400" },
          { label: "HR Tickets", value: stats.hr, color: "text-purple-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="all">All Types</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
        </select>
      </div>

      {/* Ticket Table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Ticket
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">
                Submitted By
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Type
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase hidden md:table-cell">
                Priority
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-sm">{ticket.title}</p>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <p className="text-sm text-slate-400">
                    {ticket.creator.name}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/[0.06]">
                    {ticket.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      ticket.status === "open"
                        ? "bg-blue-500/20 text-blue-400"
                        : ticket.status === "in_progress"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : ticket.status === "resolved"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-500/20 text-slate-400"
                    }`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="text-xs text-slate-400 capitalize">
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-xs text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            No tickets match the current filters
          </div>
        )}
      </div>
    </div>
  );
}
