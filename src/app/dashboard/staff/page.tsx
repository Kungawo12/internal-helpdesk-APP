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
  feedback: { rating: number; comment: string | null } | null;
};

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
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
      gsap.from(".ticket-node", {
        opacity: 0,
        x: -40,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
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
      <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="w-64 loading-bar mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Syncing_Active_Queue...</p>
      </div>
    );
  }

  const ticketType = session?.user.role === "it_staff" ? "IT" : "HR";

  return (
    <div ref={containerRef} className="pb-40">
      <div className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div>
          <div className="inline-block hud-frame px-4 py-1 border-primary/20 mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Operational_Stream</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">{ticketType}_Command_Center</h1>
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Managing_Queue_Intensity_{openTickets.length}</p>
        </div>
        
        <div className="flex gap-4">
           <div className="hud-frame p-6 border-white/5 bg-hud-bg/10 backdrop-blur-3xl min-w-[160px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">ACTIVE_THREADS</p>
              <p className="text-4xl font-black italic text-white tracking-tighter">{openTickets.length}</p>
           </div>
           <div className="hud-frame p-6 border-emerald-500/10 bg-emerald-500/5 backdrop-blur-3xl min-w-[160px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">COMPLETED_OPS</p>
              <p className="text-4xl font-black italic text-emerald-400 tracking-tighter">{resolvedTickets.length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-20">
        {/* SPEC REQUIREMENT: Open/In Progress View */}
        <section className="space-y-10">
          <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-primary flex items-center gap-4">
             <span className="w-4 h-[1px] bg-primary" /> ACTIVE_QUEUE <span className="w-4 h-[1px] bg-primary" />
          </h2>

          {openTickets.length === 0 ? (
            <div className="hud-frame p-20 text-center border-white/5 opacity-30 italic">
               <p className="text-xs font-black uppercase tracking-[0.4em]">Queue_Stability_Confirmed (0 Nodes)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {openTickets.map((ticket) => (
                <div key={ticket.id} className="ticket-node hud-frame p-10 bg-hud-bg/10 backdrop-blur-3xl border-white/5 hover:border-primary/40 transition-all duration-500 scan-effect relative group">
                  <div className="flex flex-col xl:flex-row gap-12">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-6">
                        <span className={`px-4 py-1.5 rounded-none text-[10px] font-black uppercase tracking-[0.2em] border ${
                          ticket.priority === 'urgent' ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-primary/5 border-primary/20 text-primary'
                        }`}>
                          SEVERITY_{ticket.priority}
                        </span>
                        <span className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.3em]">{ticket.status}</span>
                        <span className="text-[9px] font-mono text-slate-700">NODE_ID: {ticket.id}</span>
                      </div>

                      <div>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors mb-4">{ticket.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-4xl">{ticket.description}</p>
                      </div>

                      <div className="pt-6 flex items-center gap-8 border-t border-white/5">
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Originator</p>
                          <p className="text-xs font-black text-white uppercase tracking-tight">{ticket.creator.name} ({ticket.creator.email})</p>
                        </div>
                        <div className="h-8 w-[1px] bg-white/5" />
                        <div>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Temporal_Stamp</p>
                          <p className="text-xs font-mono text-slate-400 uppercase">{new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-64 flex flex-col gap-4">
                      {/* SPEC REQUIREMENT: Start Working Button */}
                      {ticket.status === "open" && (
                        <button
                          onClick={() => handleStatusChange(ticket.id, "in_progress")}
                          className="w-full py-5 hud-frame border-primary/40 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all transform skew-x-[-12deg]"
                        >
                          <span className="inline-block transform skew-x-[12deg]">Engage_Thread</span>
                        </button>
                      )}
                      
                      {/* SPEC REQUIREMENT: Resolve Button */}
                      <button
                        onClick={() => setResolveForm({ ticketId: ticket.id, solution: "" })}
                        className="w-full py-5 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all transform skew-x-[-12deg]"
                      >
                         <span className="inline-block transform skew-x-[12deg]">Initialize_Resolution</span>
                      </button>
                    </div>
                  </div>

                  {/* SPEC REQUIREMENT: Resolve Flow (Textarea) */}
                  {resolveForm?.ticketId === ticket.id && (
                    <div className="mt-12 pt-12 border-t border-emerald-500/20 space-y-8 animate-reveal">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Neural_Synthesis_Analysis</h4>
                      <textarea
                        value={resolveForm.solution}
                        onChange={(e) => setResolveForm({ ...resolveForm, solution: e.target.value })}
                        className="w-full px-8 py-6 bg-black/40 border border-emerald-500/10 text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 font-mono text-sm h-48 resize-none leading-relaxed"
                        placeholder="Document the resolution sequence for enterprise archival..."
                        required
                      />
                      <div className="flex gap-6">
                        <button
                          onClick={handleResolve}
                          disabled={!resolveForm.solution || resolving}
                          className="flex-1 py-5 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                          {resolving ? "Transmitting..." : "Commit_Resolved_Status"}
                        </button>
                        <button
                          onClick={() => setResolveForm(null)}
                          className="px-10 py-5 hud-frame border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
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
        </section>

        {/* SPEC REQUIREMENT: Resolved View */}
        {resolvedTickets.length > 0 && (
          <section className="space-y-10 pt-20 border-t border-white/5">
            <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-emerald-500 flex items-center gap-4">
               <span className="w-4 h-[1px] bg-emerald-500/30" /> ARCHIVED_RESOLUTIONS <span className="w-4 h-[1px] bg-emerald-500/30" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedTickets.map((ticket) => (
                <div key={ticket.id} className="hud-frame p-6 bg-emerald-500/[0.02] border-emerald-500/5 group hover:border-emerald-500/20 transition-all duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">REF_{ticket.id.slice(0, 8)}</p>
                    {ticket.feedback && (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-xs ${s <= ticket.feedback!.rating ? "text-yellow-500" : "text-white/5"}`}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-300 group-hover:text-emerald-400 transition-colors mb-2 truncate">{ticket.title}</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Initiator: {ticket.creator.name}</p>
                  <p className="text-[9px] font-mono text-slate-700 uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
