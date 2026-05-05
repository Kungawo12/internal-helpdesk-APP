"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTickets } from "@/hooks/useTickets";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
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
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-[4px] border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4 font-bold text-xl">System Error. Re-initialize connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-32">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge badge-slate !px-4 !py-2 !text-sm">Employee Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Your Requests</h1>
        </div>
        {role === "employee" && (
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/create?type=IT" className="btn-primary !px-8 !py-3 text-base flex items-center gap-2">
              🖥️ IT Ticket
            </Link>
            <Link href="/dashboard/create?type=HR" className="btn-primary !px-8 !py-3 text-base flex items-center gap-2 bg-slate-700 hover:bg-slate-800">
              👥 HR Ticket
            </Link>
          </div>
        )}
      </div>

      {/* Massive KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in delay-100">
        {[
          { label: "Total Tracking", value: stats.total, style: "bg-black text-white" },
          { label: "Needs Action", value: stats.open, style: "bg-white text-black" },
          { label: "In Progress", value: stats.inProgress, style: "bg-blue-600 text-white" },
          { label: "Resolved", value: stats.resolved, style: "bg-white text-black" },
        ].map((s, idx) => (
          <div key={idx} className={`card p-8 ${s.style}`}>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">{s.label}</p>
            <p className="text-6xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ticket Cards Grid (Replacing Table) */}
      <div className="space-y-8 animate-fade-in delay-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Active Stream</h2>
          <div className="flex w-full md:w-auto gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field max-w-xs"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field max-w-[160px]"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">Working</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                className="card p-8 cursor-pointer group hover:bg-[#fafafa]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-2">
                    <span className="badge badge-slate !px-3 !py-1">{ticket.type}</span>
                    <span className={`badge !px-3 !py-1 ${
                        ticket.status === 'resolved' ? 'badge-green' : 
                        ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'
                    }`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                  {ticket.priority === 'urgent' && <span className="text-red-500 font-extrabold text-xl">!</span>}
                </div>
                
                <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{ticket.title}</h3>
                
                <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-12">
                  <span className="text-sm font-bold text-[#6e6e73] font-mono">#{ticket.id.slice(0, 8)}</span>
                  <span className="text-sm text-[#6e6e73] font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="card p-20 text-center bg-transparent border-dashed border-2 border-black/10 shadow-none">
             <div className="text-6xl mb-6">🎫</div>
             <h3 className="text-3xl font-extrabold mb-4">No Requests Found</h3>
             <p className="text-[#6e6e73] text-lg font-medium">Create a new ticket to initiate a support stream.</p>
           </div>
        )}
      </div>
    </div>
  );
}
