"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: { name: string; email: string };
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", type: "all" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      });
  }, []);

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
        <p className="text-subtle text-xs font-medium">Compiling analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Analytics</h1>
        <p className="text-xs text-subtle mt-1">High-level oversight of global support health</p>
      </div>

      {/* Dense Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, sub: "All time" },
          { label: "Open", value: stats.open, sub: "Waiting" },
          { label: "Working", value: stats.inProgress, sub: "Active" },
          { label: "Resolved", value: stats.resolved, sub: "Finished" },
          { label: "IT Dept", value: stats.it, sub: "Technical" },
          { label: "HR Dept", value: stats.hr, sub: "People" },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 border-white/5 bg-white/[0.01]">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
            <p className="text-[8px] font-bold text-slate-700 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search all records..."
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
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white cursor-pointer"
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
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Ticket</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Requestor</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Dept</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Age</th>
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
                    <p className="font-bold text-xs text-white group-hover:text-primary transition-colors">{ticket.title}</p>
                    <p className="text-[9px] font-mono text-slate-600 mt-0.5">#{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300 font-medium">{ticket.creator.name}</td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">{ticket.type}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                       ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'
                    } text-[9px] py-0.5 px-2`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      ticket.priority === 'urgent' ? 'badge-red' : 'badge-gray'
                    } text-[9px] py-0.5 px-2`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[10px] text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-subtle text-xs font-medium">No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
