"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: { name: string; email: string };
};

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  const openTickets = useMemo(() => 
    tickets.filter((t) => (t.status === "open" || t.status === "in_progress") && 
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())))
  , [tickets, search]);

  const resolvedTickets = useMemo(() => 
    tickets.filter((t) => t.status === "resolved" || t.status === "closed")
  , [tickets]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-subtle text-xs font-medium">Syncing queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Support Queue</h1>
          <p className="text-xs text-subtle mt-1">Manage and resolve incoming employee requests</p>
        </div>
        
        <div className="flex gap-2">
           <div className="card px-5 py-2 border-white/5 bg-white/[0.02] flex flex-col items-center min-w-[100px]">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
              <span className="text-xl font-bold text-white">{openTickets.length}</span>
           </div>
           <div className="card px-5 py-2 border-white/5 bg-white/[0.02] flex flex-col items-center min-w-[100px]">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Done</span>
              <span className="text-xl font-bold text-emerald-400">{resolvedTickets.length}</span>
           </div>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Filter queue by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field py-2 pl-10 text-xs"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 text-sm">🔍</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Queue Manifest */}
        <section className="lg:col-span-8 space-y-4">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Requestor</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {openTickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => window.location.href = `/dashboard/ticket/${ticket.id}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-white group-hover:text-primary transition-colors">{ticket.title}</p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">#{ticket.id.slice(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-300">{ticket.creator.name}</p>
                        <p className="text-[10px] text-slate-600 uppercase font-bold">{ticket.type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-gray text-[10px] py-0.5 px-2">
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          ticket.priority === 'urgent' ? 'badge-red' : 'badge-blue'
                        } text-[10px] py-0.5 px-2`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-[10px] font-medium text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {openTickets.length === 0 && (
              <div className="text-center py-20">
                 <p className="text-subtle text-sm font-medium italic">All caught up! The queue is clear.</p>
              </div>
            )}
          </div>
        </section>

        {/* Dense Archive Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <h2 className="text-[10px] font-bold text-subtle uppercase tracking-[0.2em]">Recently Resolved</h2>
          <div className="space-y-2">
            {resolvedTickets.slice(0, 10).map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/ticket/${ticket.id}`} className="block group">
                <div className="card p-4 border-white/5 bg-white/[0.01] hover:border-emerald-500/30 transition-all flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-xs truncate max-w-[150px] group-hover:text-emerald-400">{ticket.title}</h3>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mt-0.5">{ticket.creator.name}</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-700">#{ticket.id.slice(0, 8)}</span>
                </div>
              </Link>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-[10px] text-slate-700 italic">No tickets resolved today.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
