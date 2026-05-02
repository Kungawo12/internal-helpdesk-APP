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
        x: -20,
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out",
      });
      gsap.from(".table-frame", {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "expo.out",
        delay: 0.4
      });
    }
  }, [loading]);

  // SPEC REQUIREMENT: Specific stats summary
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
      <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="w-64 loading-bar mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Compiling_Enterprise_Data...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-40">
      <div className="mb-20">
        <div className="inline-block hud-frame px-4 py-1 border-accent/20 mb-4">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Strategic_Oversight</span>
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">Enterprise_Intelligence</h1>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Realtime_Infrastructure_Manifest</p>
      </div>

      {/* Stats Grid - SPEC REQUIREMENT */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
        {[
          { label: "Aggregate_Total", value: stats.total, color: "text-white" },
          { label: "Active_Nodes", value: stats.open, color: "text-primary" },
          { label: "Processing_Flow", value: stats.inProgress, color: "text-yellow-500" },
          { label: "Protocol_Resolved", value: stats.resolved, color: "text-emerald-500" },
          { label: "IT_Infrastructure", value: stats.it, color: "text-cyan-400" },
          { label: "Human_Logistics", value: stats.hr, color: "text-accent" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="stat-card hud-frame p-6 bg-hud-bg/10 backdrop-blur-3xl border-white/5 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity animate-glitch" />
            <p className={`text-4xl font-black italic tracking-tighter ${stat.color} mb-2`}>{stat.value}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters - SPEC REQUIREMENT */}
      <div className="flex flex-wrap gap-4 mb-10">
        <div className="hud-frame p-1 border-primary/20 bg-white/5 transform skew-x-[-12deg]">
           <div className="flex items-center transform skew-x-[12deg]">
              <span className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Filter_Status</span>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-6 py-2.5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all" className="bg-bg-dark">GLOBAL</option>
                <option value="open" className="bg-bg-dark">OPEN</option>
                <option value="in_progress" className="bg-bg-dark">IN_PROGRESS</option>
                <option value="resolved" className="bg-bg-dark">RESOLVED</option>
                <option value="closed" className="bg-bg-dark">CLOSED</option>
              </select>
           </div>
        </div>

        <div className="hud-frame p-1 border-primary/20 bg-white/5 transform skew-x-[-12deg]">
           <div className="flex items-center transform skew-x-[12deg]">
              <span className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Filter_Vertical</span>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="px-6 py-2.5 bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all" className="bg-bg-dark">GLOBAL</option>
                <option value="IT" className="bg-bg-dark">IT_OPERATIONS</option>
                <option value="HR" className="bg-bg-dark">HUMAN_LOGISTICS</option>
              </select>
           </div>
        </div>
      </div>

      {/* Ticket Table - SPEC REQUIREMENT */}
      <div className="table-frame hud-frame border-white/5 bg-hud-bg/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Node_Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic hidden md:table-cell">Initiator</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Sector</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Status_Flag</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic hidden md:table-cell">Urgency</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic hidden lg:table-cell text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="group hover:bg-primary/[0.03] transition-all duration-300 scan-effect cursor-pointer">
                  <td className="px-8 py-6">
                    <p className="font-black text-sm text-white group-hover:text-primary transition-colors italic uppercase">{ticket.title}</p>
                    <p className="text-[9px] font-mono text-slate-700 mt-1">REF_{ticket.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.creator.name}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{ticket.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black uppercase tracking-widest italic ${
                       ticket.status === 'resolved' ? 'text-emerald-500' : 'text-primary'
                    }`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6 hidden md:table-cell">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      ticket.priority === 'urgent' ? 'text-accent' : 'text-slate-600'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6 hidden lg:table-cell text-right font-mono text-[10px] text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-32">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 animate-pulse">NO_OPERATIONAL_DATA_IN_CURRENT_VIEW</p>
          </div>
        )}
      </div>
    </div>
  );
}
