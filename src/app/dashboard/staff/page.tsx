"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  solution: string | null;
  createdAt: string;
  creator: { name: string; email: string };
  feedback: { rating: number; comment: string | null } | null;
};

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-subtle text-sm font-medium">Loading ticket queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Ticket Queue</h1>
          <p className="text-subtle mt-1">Manage and resolve incoming employee requests</p>
        </div>
        
        <div className="flex gap-4">
           <div className="card px-8 py-4 border-white/5 bg-white/[0.02] flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Open Tickets</span>
              <span className="text-3xl font-bold text-white">{openTickets.length}</span>
           </div>
           <div className="card px-8 py-4 border-white/5 bg-white/[0.02] flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resolved Today</span>
              <span className="text-3xl font-bold text-emerald-400">{resolvedTickets.length}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Active Queue */}
        <section className="lg:col-span-8 space-y-6">
          <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-6">Active Queue</h2>

          {openTickets.length === 0 ? (
            <div className="card p-20 text-center border-dashed border-white/10 bg-transparent">
               <p className="text-subtle font-medium italic">All caught up! The queue is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {openTickets.map((ticket) => (
                <Link 
                  key={ticket.id} 
                  href={`/dashboard/ticket/${ticket.id}`}
                  className="block group"
                >
                  <div className="card p-8 border-white/5 hover:border-primary/40 transition-all duration-300">
                    <div className="flex flex-col xl:flex-row justify-between gap-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                          <span className={`badge ${
                            ticket.priority === 'urgent' ? 'badge-red' : 'badge-blue'
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className="badge badge-gray">{ticket.status.replace("_", " ")}</span>
                          <span className="text-[11px] font-mono text-slate-700">#{ticket.id.slice(0, 8)}</span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-primary transition-colors">{ticket.title}</h3>
                        <p className="text-subtle text-sm leading-relaxed mb-8 line-clamp-2">{ticket.description}</p>

                        <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Requested By</p>
                            <p className="text-sm font-bold text-white">{ticket.creator.name}</p>
                          </div>
                          <div className="h-8 w-[1px] bg-white/5" />
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Submitted</p>
                            <p className="text-sm font-medium text-slate-400">{new Date(ticket.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="xl:w-48 flex flex-col justify-center">
                        <span className="btn-primary w-full text-center">View & Resolve</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Resolved Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <h2 className="text-sm font-bold text-subtle uppercase tracking-[0.2em] mb-6">Recently Resolved</h2>
          <div className="space-y-4">
            {resolvedTickets.slice(0, 10).map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/ticket/${ticket.id}`} className="block group">
                <div className="card p-5 border-white/5 bg-white/[0.01] hover:border-emerald-500/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-sm truncate pr-4 group-hover:text-emerald-400">{ticket.title}</h3>
                    {ticket.feedback && (
                      <div className="flex text-[10px] text-yellow-500">
                        ★ {ticket.feedback.rating}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                    <span>{ticket.creator.name}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-xs text-slate-700 italic">No tickets resolved today.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
