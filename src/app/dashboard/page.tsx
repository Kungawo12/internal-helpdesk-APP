"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
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
  feedback?: {
    rating: number;
    comment: string | null;
  } | null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState<{ ticketId: string; rating: number; comment: string } | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      gsap.from(".data-pane", {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
      });
    }
  }, [loading]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm) return;
    setSubmittingFeedback(true);

    await fetch(`/api/tickets/${feedbackForm.ticketId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: feedbackForm.rating, comment: feedbackForm.comment }),
    });

    setSubmittingFeedback(false);
    setFeedbackForm(null);
    fetchTickets();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="w-64 loading-bar mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Syncing_Nodes...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-40">
      <div className="mb-20">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">Operational_Stream</h1>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Active_Data_Nodes_For_{session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="data-pane group">
            <div className="hud-frame p-8 bg-hud-bg/10 backdrop-blur-3xl border-white/5 hover:border-primary/40 transition-all duration-500 scan-effect">
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Basic Info */}
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-3 py-1 rounded-none text-[9px] font-black uppercase tracking-widest border ${
                      ticket.priority === 'urgent' ? 'border-accent bg-accent/10 text-accent' : 'border-primary/30 bg-primary/5 text-primary'
                    }`}>
                      PRIORITY_{ticket.priority}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">STATUS_{ticket.status}</span>
                    <span className="text-[9px] font-mono text-slate-700">NODE_{ticket.id.slice(0, 8)}</span>
                  </div>

                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-primary transition-colors mb-4 leading-none">
                      {ticket.title}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 pt-4 opacity-50">
                     <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">INITIATED: {new Date(ticket.createdAt).toLocaleString()}</p>
                     <div className="w-1 h-1 bg-slate-800 rounded-full" />
                     <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">SECTOR: {ticket.type}</p>
                  </div>
                </div>

                {/* Resolution & Feedback */}
                <div className="lg:w-96 space-y-6">
                  {ticket.status === "resolved" && (
                    <div className="hud-frame p-6 bg-emerald-500/5 border-emerald-500/20">
                      <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-4 italic">Verification_Result</p>
                      <p className="text-xs text-slate-300 italic mb-6">"{ticket.solution}"</p>
                      
                      {!ticket.feedback ? (
                        <button 
                          onClick={() => setFeedbackForm({ ticketId: ticket.id, rating: 5, comment: "" })}
                          className="w-full py-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                        >
                          Provide_Neural_Feedback
                        </button>
                      ) : (
                        <div className="border-t border-emerald-500/10 pt-4">
                          <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < ticket.feedback!.rating ? "text-yellow-500" : "text-white/5"}`}>★</span>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-wider">Feedback_Stored_Successfully</p>
                        </div>
                      )}
                    </div>
                  )}

                  {ticket.status !== "resolved" && (
                    <div className="h-full flex items-center justify-center opacity-10">
                       <span className="text-5xl">⚡</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Overlay Form */}
              {feedbackForm?.ticketId === ticket.id && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Operational_Rating</h3>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: r })}
                        className={`w-12 h-12 hud-frame flex items-center justify-center text-lg transition-all ${
                          feedbackForm.rating === r ? "bg-primary text-black border-primary" : "text-slate-500 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 font-mono text-xs h-24 resize-none"
                    placeholder="Enter analytical comments (optional)..."
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={submittingFeedback}
                      className="flex-1 py-4 bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                      {submittingFeedback ? "Transmitting..." : "Submit_Feedback_Protocol"}
                    </button>
                    <button
                      onClick={() => setFeedbackForm(null)}
                      className="px-8 py-4 hud-frame border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      Abort
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="py-40 text-center">
            <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-600">No_Active_Nodes_Found</p>
          </div>
        )}
      </div>

      {/* Floating Action HUD */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000]">
         <a 
           href="/dashboard/create" 
           className="hud-frame px-10 py-4 bg-primary/10 border-primary/40 backdrop-blur-2xl flex items-center gap-4 group hover:bg-primary hover:scale-105 transition-all cursor-pointer"
         >
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white group-hover:text-black">Execute_New_Protocol</span>
            <span className="text-xl group-hover:text-black">+</span>
         </a>
      </div>
    </div>
  );
}
