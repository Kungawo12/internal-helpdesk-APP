"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

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

const statusColors: Record<string, string> = {
  open: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  in_progress: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  closed: "text-slate-500 bg-white/5 border-white/10",
};

export default function ManagerDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", type: "all" });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from(".stat-card", {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out",
      });
    }
  }, [loading]);

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
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Compiling Analytics...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2">Enterprise Intelligence</h1>
        <p className="text-slate-500 font-medium tracking-tight">
          Real-time oversight across all operational verticals.
        </p>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
        {[
          { label: "Aggregate", value: stats.total, color: "text-white", icon: "📊" },
          { label: "Active", value: stats.open, color: "text-blue-400", icon: "⚡" },
          { label: "Processing", value: stats.inProgress, color: "text-yellow-400", icon: "⚙️" },
          { label: "Fulfilled", value: stats.resolved, color: "text-emerald-400", icon: "✅" },
          { label: "IT Vertical", value: stats.it, color: "text-cyan-400", icon: "🖥️" },
          { label: "HR Vertical", value: stats.hr, color: "text-purple-400", icon: "👥" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="stat-card glass rounded-[24px] p-6 border-white/5 relative overflow-hidden group"
          >
            <span className="text-xl mb-4 block opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</span>
            <p className={`text-3xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">{stat.label}</p>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-5 py-2.5 glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            <option value="all">Global Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-5 py-2.5 glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
          >
            <option value="all">Global Type</option>
            <option value="IT">IT Infrastructure</option>
            <option value="HR">Human Resources</option>
          </select>
        </div>
        
        <button className="px-6 py-2.5 glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
          Export Manifest (CSV)
        </button>
      </div>

      {/* Ticket Table */}
      <div className="glass rounded-[32px] border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Subject / Intent</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hidden md:table-cell">Initiator</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vertical</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hidden md:table-cell">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hidden lg:table-cell text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="group hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-8 py-5">
                    <p className="font-bold text-sm text-slate-200 group-hover:text-primary transition-colors">{ticket.title}</p>
                    <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase">{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-8 py-5 hidden md:table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                        {ticket.creator.name.charAt(0)}
                      </div>
                      <p className="text-xs font-bold text-slate-400">{ticket.creator.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-500">
                      {ticket.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-md border ${statusColors[ticket.status]}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-8 py-5 hidden md:table-cell">
                    <span className={`text-xs font-bold capitalize ${
                      ticket.priority === 'urgent' ? 'text-red-500' : 
                      ticket.priority === 'high' ? 'text-orange-500' : 'text-slate-500'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-8 py-5 hidden lg:table-cell text-right">
                    <span className="text-[10px] font-bold text-slate-600 tabular-nums uppercase tracking-widest">
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-600">No matching operational data</p>
          </div>
        )}
      </div>
    </div>
  );
}
