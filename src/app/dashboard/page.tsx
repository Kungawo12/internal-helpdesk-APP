"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTickets } from "@/hooks/useTickets";

function SlaBadge({ ticket }: { ticket: { slaResolutionDue: string | null; slaBreached: boolean; status: string } }) {
  if (ticket.status === "resolved" || !ticket.slaResolutionDue) return null;
  const diff = new Date(ticket.slaResolutionDue).getTime() - Date.now();
  const breached = ticket.slaBreached || diff < 0;
  const atRisk = !breached && diff < 60 * 60 * 1000; // < 1 hour
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const label = breached ? "Breached" : hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  const cls = breached
    ? "bg-red-50 text-red-700 border border-red-200"
    : atRisk
    ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-emerald-50 text-emerald-700 border border-emerald-200";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { tickets: allTickets, loading, error } = useTickets();

  const stats = useMemo(() => ({
    total: allTickets.length,
    open: allTickets.filter(t => t.status === 'open').length,
    inProgress: allTickets.filter(t => t.status === 'in_progress').length,
    resolved: allTickets.filter(t => t.status === 'resolved').length,
  }), [allTickets]);

  const tickets = useMemo(() => {
    return allTickets.filter(t => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allTickets, statusFilter, search]);

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
            <span className="text-sm font-semibold text-[#6e6e73]">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Welcome back,<br/>{session?.user?.name?.split(' ')[0] || "User"}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {role === "employee" && (
            <>
              <Link href="/dashboard/create?type=IT" className="btn-primary !px-8 !py-3 text-base flex items-center gap-2">
                🖥️ IT Ticket
              </Link>
              <Link href="/dashboard/create?type=HR" className="btn-primary !px-8 !py-3 text-base flex items-center gap-2 bg-slate-700 hover:bg-slate-800">
                👥 HR Ticket
              </Link>
            </>
          )}
          {role === "admin" && (
            <Link href="/admin" className="btn-primary !px-6 !py-3 text-sm flex items-center gap-2 bg-red-700 hover:bg-red-600">
              🔐 Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Massive KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in delay-100">
        {[
          { label: "Total Tracking", value: stats.total, style: "bg-black text-white", icon: "🎫" },
          { label: "Needs Action", value: stats.open, style: "bg-white text-black", icon: "🔴" },
          { label: "In Progress", value: stats.inProgress, style: "bg-blue-600 text-white", icon: "⚡" },
          { label: "Resolved", value: stats.resolved, style: "bg-white text-black", icon: "✅" },
        ].map((s, idx) => (
          <div key={idx} className={`card p-8 relative overflow-hidden ${s.style}`}>
            <div className="absolute top-6 right-6 text-2xl opacity-80">{s.icon}</div>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">{s.label}</p>
            <p className="text-6xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 animate-fade-in delay-200">
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Activity</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Ticket Cards Grid (Replacing Table) */}
      <div className="space-y-8 animate-fade-in delay-300">
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

        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              let borderClass = "";
              if (ticket.status === "open") borderClass = "ticket-card-open";
              if (ticket.status === "in_progress") borderClass = "ticket-card-progress";
              if (ticket.status === "resolved") borderClass = "ticket-card-resolved";

              return (
                <div 
                  key={ticket.id} 
                  onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  className={`card p-8 cursor-pointer group hover:bg-[#fafafa] relative ${borderClass}`}
                >
                  <div className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full ${
                    ticket.priority === 'urgent' ? 'bg-red-500' :
                    ticket.priority === 'high'   ? 'bg-orange-400' : 'bg-slate-300'
                  }`} />
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-2">
                      <span className="badge badge-slate !px-3 !py-1">{ticket.type}</span>
                      <span className={`badge !px-3 !py-1 ${
                          ticket.status === 'resolved' ? 'badge-green' : 
                          ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <SlaBadge ticket={ticket} />
                    </div>
                  </div>
                
                <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{ticket.title}</h3>
                
                <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-12">
                  <span className="text-sm font-bold text-[#6e6e73] font-mono">#{ticket.id.slice(0, 8)}</span>
                  <span className="text-sm text-[#6e6e73] font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
           <div className="card p-20 text-center bg-transparent border-dashed border-2 border-black/10 shadow-none">
             <div className="text-8xl mb-6 opacity-20">🎫</div>
             <h3 className="text-3xl font-extrabold mb-4">No tickets yet</h3>
             <p className="text-[#6e6e73] text-lg font-medium mb-6">Your support requests will appear here once submitted.</p>
             {role === "employee" && (
               <Link href="/dashboard/create" className="text-blue-600 font-bold hover:underline">
                 Submit your first ticket →
               </Link>
             )}
           </div>
        )}
      </div>
    </div>
  );
}
