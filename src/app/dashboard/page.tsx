"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";
import gsap from "gsap";

export default function DashboardPage() {
  const router = useRouter();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!loading) {
      gsap.from(".ticket-card", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "expo.out",
        delay: 0.2
      });
      gsap.from(".hud-animate", {
        scale: 0.9,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
      });
    }
  }, [loading]);

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
      <div className="space-y-12 animate-pulse">
        <div className="h-16 w-full glass-card skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 glass-card skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Cinematic Search HUD */}
      <div className="hud-animate flex flex-col items-center gap-8 text-center pt-8">
        <div className="space-y-2">
          <h1 className="heading-prime text-5xl md:text-6xl tracking-tight">Service Manifest</h1>
          <p className="text-slate-400 font-medium text-lg tracking-wide">Securely monitoring {stats.total} active support streams</p>
        </div>

        <div className="w-full max-w-3xl relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-700 opacity-50" />
          <div className="relative flex items-center bg-black/60 border border-white/10 rounded-[32px] p-2 backdrop-blur-3xl shadow-2xl">
            <div className="pl-6 pr-4 opacity-30 text-2xl">🔍</div>
            <input
              type="text"
              placeholder="Search by ID, title, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none py-4 text-lg font-medium text-white outline-none placeholder:text-slate-600"
            />
            <div className="flex items-center gap-2 pr-4">
              <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest hidden sm:block">Uplink_Active</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { id: "all", label: "Global", count: stats.total, color: "bg-white/10" },
            { id: "open", label: "Open", count: stats.open, color: "bg-amber-500/20 text-amber-400 border-amber-500/20" },
            { id: "in_progress", label: "Working", count: stats.inProgress, color: "bg-primary/20 text-primary border-primary/20" },
            { id: "resolved", label: "Resolved", count: stats.resolved, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-8 py-3 rounded-2xl border text-sm font-bold transition-all ${
                statusFilter === f.id ? `${f.color} shadow-lg shadow-primary/10 ring-1 ring-white/10` : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
              }`}
            >
              {f.label} <span className="ml-2 opacity-40 font-mono text-xs">{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Create New Card */}
        <Link href="/dashboard/create" className="ticket-card group flex flex-col items-center justify-center h-[320px] rounded-[40px] border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-primary/5 hover:border-primary/20 transition-all duration-500">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl group-hover:bg-primary group-hover:scale-110 group-hover:text-white transition-all duration-500 shadow-inner">
             +
           </div>
           <p className="mt-6 text-lg font-black text-slate-500 group-hover:text-white transition-colors">Submit New Request</p>
           <p className="text-xs text-slate-600 mt-2">Initialize support stream</p>
        </Link>

        {filteredTickets.map((ticket) => (
          <div 
            key={ticket.id}
            onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
            className="ticket-card group glass-card flex flex-col h-[320px] rounded-[40px] cursor-pointer p-8"
          >
            {/* Top Row: Type & ID */}
            <div className="flex items-start justify-between mb-8">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                {ticket.type === 'IT' ? '💻' : '📋'}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-1">Stream_ID</span>
                <span className="text-xs font-mono font-bold text-white tracking-widest">#{ticket.id.slice(0, 8)}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              <h3 className="text-2xl font-black text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {ticket.title}
              </h3>
              <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">
                {ticket.description}
              </p>
            </div>

            {/* Footer: Progress & Status */}
            <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full animate-pulse ${
                       ticket.status === 'resolved' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 
                       ticket.status === 'in_progress' ? 'bg-primary shadow-[0_0_10px_#0ea5e9]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                     }`} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                       {ticket.status.replace("_", " ")}
                     </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    Priority: {ticket.priority}
                  </span>
               </div>
               
               <div className="progress-bar-container h-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                  <div 
                    className={`progress-bar-fill ${
                      ticket.status === 'resolved' ? 'bg-emerald-500' : 
                      ticket.priority === 'urgent' ? 'bg-red-500' : 'bg-primary'
                    }`} 
                    style={{ width: ticket.status === 'resolved' ? '100%' : ticket.status === 'in_progress' ? '65%' : '15%' }} 
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="hud-animate text-center py-20 opacity-30">
          <p className="text-2xl font-black text-white uppercase tracking-widest">No Active Streams Detected</p>
        </div>
      )}
    </div>
  );
}
