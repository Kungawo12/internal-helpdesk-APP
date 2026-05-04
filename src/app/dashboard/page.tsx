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
      gsap.from(".animate-in", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-[3px] border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Manifest</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="prism-bg">
        <div className="prism-mesh" />
        <div 
          className="prism-wallpaper" 
          style={{ backgroundImage: 'url("/images/support_helpdesk_center_bg.png")' }} 
        />
      </div>
      
      {/* Premium Header */}
      <div className="animate-in flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-[#0f172a] tracking-tight">Overview</h1>
          <p className="text-lg text-[#475569] font-medium">Manage and track your active support requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-prism !py-4 !px-8 shadow-2xl">
          <span className="mr-2 text-xl">+</span> Create New Request
        </Link>
      </div>

      {/* Stats Cards - Refined Glass */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Volume", value: stats.total, color: "text-slate-900", icon: "💎" },
          { label: "Active", value: stats.open, color: "text-amber-600", icon: "⚡" },
          { label: "In Production", value: stats.inProgress, color: "text-blue-600", icon: "⚙️" },
          { label: "Resolved", value: stats.resolved, color: "text-emerald-600", icon: "✅" },
        ].map((s, idx) => (
          <div key={idx} className="animate-in glass-panel p-6 border-white/80">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
               <span className="text-lg grayscale opacity-50">{s.icon}</span>
            </div>
            <p className={`text-4xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main List Container */}
      <div className="animate-in glass-panel bg-white/40 border-white/50 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title, ID or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-prism w-full pl-12 bg-white/80"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50">
            {['all', 'open', 'in_progress', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-wider ${
                  statusFilter === f ? "bg-[#0f172a] text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
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
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Ticket</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dept</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-white/60 transition-all cursor-pointer group"
                  onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[#0f172a] text-lg group-hover:text-blue-600 transition-colors tracking-tight">
                        {ticket.title}
                      </span>
                      <span className="text-[10px] font-black font-mono text-slate-400 mt-1 uppercase tracking-widest">
                        Ref_ID: {ticket.id.slice(0, 8)}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase border border-blue-100 shadow-sm">{ticket.type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`badge-prism ${
                      ticket.status === 'resolved' ? 'badge-green' : 
                      ticket.status === 'in_progress' ? 'badge-blue' : 'badge-amber'
                    }`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${
                      ticket.priority === 'urgent' ? 'text-red-500' :
                      ticket.priority === 'high' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-32 text-center bg-white/40">
             <div className="text-6xl mb-6">📂</div>
            <h3 className="text-2xl font-extrabold text-[#0f172a] mb-2">No active records</h3>
            <p className="text-[#475569] mb-8 font-medium">Your support stream is currently clear.</p>
            <Link href="/dashboard/create" className="btn-prism !py-4 !px-10">
              Submit Your First Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
