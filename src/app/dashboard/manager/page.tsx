"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { useSession } from "next-auth/react";

export default function ManagerDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const { tickets, loading, error } = useTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const resolved = tickets.filter(t => t.status === 'resolved');
    const totalResolutionTime = resolved.reduce((acc, t) => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      return acc + (updated - created);
    }, 0);
    const avgResTime = resolved.length > 0 ? (totalResolutionTime / resolved.length / (1000 * 60 * 60)).toFixed(1) : "0";

    const feedbackTickets = tickets.filter(t => t.feedback?.rating);
    const avgSatisfaction = feedbackTickets.length > 0 
      ? (feedbackTickets.reduce((acc, t) => acc + (t.feedback?.rating || 0), 0) / feedbackTickets.length).toFixed(1)
      : "0";

    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolvedCount: resolved.length,
      itCount: tickets.filter(t => t.type === 'IT').length,
      hrCount: tickets.filter(t => t.type === 'HR').length,
      itOpen: tickets.filter(t => t.type === 'IT' && t.status === 'open').length,
      hrOpen: tickets.filter(t => t.type === 'HR' && t.status === 'open').length,
      itResolved: tickets.filter(t => t.type === 'IT' && t.status === 'resolved').length,
      hrResolved: tickets.filter(t => t.type === 'HR' && t.status === 'resolved').length,
      avgResTime,
      avgSatisfaction,
      priority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
      }
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                           t.id.toLowerCase().includes(search.toLowerCase()) ||
                           t.creator?.name?.toLowerCase().includes(search.toLowerCase());
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
            <span className="badge badge-slate !px-4 !py-2 !text-sm">Manager Portal</span>
            <span className="text-sm font-semibold text-[#6e6e73]">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Overview,<br/>{session?.user?.name || "Executive"}</h1>
        </div>
      </div>

      {/* Massive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in delay-100">
        <div className="card p-8 bg-black text-white">
          <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Volume</p>
          <p className="text-6xl font-extrabold mb-2">{stats.total}</p>
          <p className="text-sm text-white/80 font-medium">Total Tickets Tracked</p>
        </div>
        
        <div className="card p-8 bg-blue-600 text-white">
          <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Active</p>
          <p className="text-6xl font-extrabold mb-2">{stats.open + stats.inProgress}</p>
          <p className="text-sm text-white/80 font-medium">Require Attention</p>
        </div>

        <div className="card p-8">
          <p className="text-sm font-bold text-[#6e6e73] uppercase tracking-widest mb-4">Resolution</p>
          <p className="text-6xl font-extrabold mb-2 text-black">{stats.avgResTime}h</p>
          <p className="text-sm text-[#6e6e73] font-medium">Average Time to Close</p>
        </div>

        <div className="card p-8">
          <p className="text-sm font-bold text-[#6e6e73] uppercase tracking-widest mb-4">Quality</p>
          <p className="text-6xl font-extrabold mb-2 text-black">{stats.avgSatisfaction}</p>
          <p className="text-sm text-[#6e6e73] font-medium">CSAT out of 5.0</p>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in delay-200">
        <div className="lg:col-span-2 card p-8 md:p-10 space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Department Activity</h3>
          <div className="space-y-6">
            <div className="bg-[#f5f5f7] p-6 rounded-[24px]">
              <div className="flex justify-between items-end mb-3">
                <span className="text-lg font-bold">IT Operations</span>
                <span className="text-2xl font-extrabold">{stats.itCount}</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-4 overflow-hidden">
                <div className="bg-black h-4 rounded-full" style={{ width: `${(stats.itCount / (stats.total || 1)) * 100}%` }}></div>
              </div>
              <div className="flex gap-6 mt-4 text-sm font-semibold text-[#6e6e73]">
                <span>Open: {stats.itOpen}</span>
                <span>Resolved: {stats.itResolved}</span>
              </div>
            </div>
            
            <div className="bg-[#f5f5f7] p-6 rounded-[24px]">
              <div className="flex justify-between items-end mb-3">
                <span className="text-lg font-bold">HR Operations</span>
                <span className="text-2xl font-extrabold">{stats.hrCount}</span>
              </div>
              <div className="w-full bg-black/5 rounded-full h-4 overflow-hidden">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${(stats.hrCount / (stats.total || 1)) * 100}%` }}></div>
              </div>
              <div className="flex gap-6 mt-4 text-sm font-semibold text-[#6e6e73]">
                <span>Open: {stats.hrOpen}</span>
                <span>Resolved: {stats.hrResolved}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8 md:p-10 space-y-8 bg-black text-white">
          <h3 className="text-2xl font-bold tracking-tight">Priority</h3>
          <div className="flex items-end h-[200px] gap-4">
             {[
                { label: "Low", value: stats.priority.low, color: "bg-white/20" },
                { label: "Med", value: stats.priority.medium, color: "bg-white/40" },
                { label: "High", value: stats.priority.high, color: "bg-white/70" },
                { label: "Urgent", value: stats.priority.urgent, color: "bg-white" },
             ].map((p, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3">
                   <div className="text-xl font-bold">{p.value}</div>
                   <div className={`w-full rounded-xl ${p.color} animate-bar-grow`} style={{ height: `${Math.max((p.value / (stats.total || 1)) * 100, 5)}%` }}></div>
                   <span className="text-xs font-bold uppercase tracking-wider text-white/50">{p.label}</span>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Ticket Cards Grid (Replacing Table) */}
      <div className="space-y-8 animate-fade-in delay-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Active Manifest</h2>
          <div className="flex w-full md:w-auto gap-4">
            <button className="btn-secondary whitespace-nowrap !py-2 !text-sm border border-black/10">🔄 Refresh</button>
            <button className="btn-secondary whitespace-nowrap !py-2 !text-sm border border-black/10">⬇ Export CSV</button>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field max-w-[140px]"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field max-w-[140px]"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">Working</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {filteredTickets.length > 0 ? (
          <div className="bg-white rounded-[40px] border border-black/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-widest text-[#6e6e73]">
                  <th className="p-6 font-bold">Ticket</th>
                  <th className="p-6 font-bold hidden md:table-cell">Creator</th>
                  <th className="p-6 font-bold">Status</th>
                  <th className="p-6 font-bold hidden lg:table-cell">Date</th>
                  <th className="p-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-lg font-medium">
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                    className="border-b border-black/5 hover:bg-[#f4f4f4] cursor-pointer transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        {ticket.priority === 'urgent' && <span className="text-red-500 font-extrabold">!</span>}
                        <div>
                          <p className="font-bold group-hover:text-blue-600 transition-colors">{ticket.title}</p>
                          <p className="text-sm text-[#6e6e73]">{ticket.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                          {ticket.creator?.name?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm font-bold">{ticket.creator?.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`badge !px-3 !py-1 ${
                          ticket.status === 'resolved' ? 'badge-green' : 
                          ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-6 hidden lg:table-cell text-sm text-[#6e6e73] font-semibold">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline-block text-black/20 group-hover:text-black transition-colors transform group-hover:translate-x-1"><path d="M16.6075 11.8572L13.255 8.40897L14.1388 7.5L19 12.5L14.1388 17.5L13.255 16.591L16.6075 13.1428H5V11.8572H16.6075Z"></path></svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card p-20 text-center bg-transparent border-dashed border-2 border-black/10 shadow-none">
            <h3 className="text-2xl font-bold mb-2">No tickets found</h3>
            <p className="text-[#6e6e73]">Adjust your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
}
