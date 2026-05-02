"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

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
  assignee: { name: string; email: string } | null;
  feedback: { rating: number; comment: string | null } | null;
};

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const statusColors: Record<string, string> = {
  open: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  in_progress: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  closed: "text-slate-500 bg-white/5 border-white/10",
};

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveForm, setResolveForm] = useState<{
    ticketId: string;
    solution: string;
  } | null>(null);
  const [resolving, setResolving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    data.sort((a: Ticket, b: Ticket) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      gsap.from(".ticket-row", {
        opacity: 0,
        x: -20,
        stagger: 0.05,
        duration: 0.6,
        ease: "power2.out",
      });
    }
  }, [loading]);

  const handleResolve = async () => {
    if (!resolveForm) return;
    setResolving(true);

    await fetch(`/api/tickets/${resolveForm.ticketId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solution: resolveForm.solution, status: "resolved" }),
    });

    setResolving(false);
    setResolveForm(null);
    fetchTickets();
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    await fetch(`/api/tickets/${ticketId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTickets();
  };

  const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Synchronizing Queue...</p>
      </div>
    );
  }

  const ticketType = session?.user.role === "it_staff" ? "IT" : "HR";

  return (
    <div ref={containerRef}>
      <div className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">{ticketType} Command Center</h1>
          <p className="text-slate-500 font-medium tracking-tight">
            Prioritized operational stream for resolution engineers.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Open Threads</p>
            <p className="text-xl font-black text-white">{openTickets.length}</p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Resolved</p>
            <p className="text-xl font-black text-emerald-400">{resolvedTickets.length}</p>
          </div>
        </div>
      </div>

      {/* Active Queue */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">High-Priority Queue</h2>
        </div>

        {openTickets.length === 0 ? (
          <div className="glass rounded-[40px] border-white/5 p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl mb-6 grayscale opacity-30">
              ☕
            </div>
            <h2 className="text-xl font-bold mb-2 text-slate-300">Queue Depleted</h2>
            <p className="text-slate-500 text-sm max-w-xs">All operational requests have been fulfilled. Stand by for new incoming data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {openTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="ticket-row group glass rounded-[32px] p-8 border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.15em] border ${
                        ticket.priority === 'urgent' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        ticket.priority === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                        'bg-white/5 border-white/10 text-slate-500'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.15em] border ${statusColors[ticket.status]}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 uppercase">Ref: {ticket.id.slice(0, 8)}</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                        {ticket.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        {ticket.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                          {ticket.creator.name.charAt(0)}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ticket.creator.name}</p>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-slate-800" />
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-3 w-full lg:w-48">
                    {ticket.status === "open" && (
                      <button
                        onClick={() => handleStatusChange(ticket.id, "in_progress")}
                        className="flex-1 py-3 glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/20 transition-all"
                      >
                        Engage Thread
                      </button>
                    )}
                    <button
                      onClick={() => setResolveForm({ ticketId: ticket.id, solution: "" })}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 hover:brightness-110 transition-all"
                    >
                      Verify Solution
                    </button>
                  </div>
                </div>

                {/* Sophisticated Resolve Form */}
                {resolveForm?.ticketId === ticket.id && (
                  <div className="mt-8 p-8 glass border-emerald-500/20 rounded-[24px] space-y-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none" />
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 block mb-4">
                        Resolution Synthesis
                      </label>
                      <textarea
                        value={resolveForm.solution}
                        onChange={(e) => setResolveForm({ ...resolveForm, solution: e.target.value })}
                        className="w-full px-6 py-4 glass border-white/10 rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[120px] resize-none"
                        placeholder="Document the technical steps taken and the verified outcome..."
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleResolve}
                        disabled={!resolveForm.solution || resolving}
                        className="flex-1 py-3.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
                      >
                        {resolving ? "Transmitting..." : "Commit Resolution"}
                      </button>
                      <button
                        onClick={() => setResolveForm(null)}
                        className="px-8 py-3.5 glass border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive / Resolved Section */}
      {resolvedTickets.length > 0 && (
        <div className="pt-10 border-t border-white/5">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-600 mb-8 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500/30" />
            Fulfilled Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resolvedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="glass rounded-2xl p-6 border-white/5 flex items-center justify-between group hover:border-white/10 transition-all"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-400 truncate group-hover:text-slate-200 transition-colors">
                    {ticket.title}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-widest">
                    {ticket.creator.name} • {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {ticket.feedback && (
                  <div className="flex gap-0.5 ml-4 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-xs ${s <= ticket.feedback!.rating ? "text-yellow-500" : "text-white/5"}`}>★</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
