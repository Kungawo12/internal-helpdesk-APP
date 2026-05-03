"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTicket } from "@/hooks/useTicket";
import Link from "next/link";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { ticket, loading, error, refresh } = useTicket(id as string);
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const [solution, setSolution] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    await fetch(`/api/tickets/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setSubmittingFeedback(false);
    refresh();
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/tickets/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolving(true);
    await fetch(`/api/tickets/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved", solution }),
    });
    setResolving(false);
    setShowResolveForm(false);
    refresh();
  };

  if (loading) return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Loading Ticket Details...</p>
    </div>
  );

  if (error || !ticket) return (
    <div className="card p-8 text-center border-red-500/20 bg-red-500/5">
      <p className="text-sm font-bold text-white mb-4">{error || "Ticket not found"}</p>
      <Link href="/dashboard" className="btn-primary py-2 px-6 mx-auto inline-flex">Back to Dashboard</Link>
    </div>
  );

  const isCreator = session?.user?.id === ticket.creatorId;
  const isStaff = session?.user?.role === 'it_staff' || session?.user?.role === 'hr_staff';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all">←</button>
          <div className="space-y-0.5">
            <h1 className="heading-prime text-xl">{ticket.title}</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">#{ticket.id.slice(0, 12)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className={`badge ${ticket.type === 'IT' ? 'badge-blue' : 'badge-amber'}`}>{ticket.type}</span>
           <span className={`badge ${ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'}`}>{ticket.status.replace("_", " ")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-black/40 space-y-6">
            <div className="space-y-2">
               <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
               <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {ticket.solution && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                 <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Resolution Solution</label>
                 <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.solution}</p>
              </div>
            )}
          </div>

          {/* Feedback Section */}
          {ticket.status === 'resolved' && (
            <div className="card p-6 bg-black/40 space-y-6">
               <h2 className="text-sm font-bold text-white border-b border-white/5 pb-4">Service Feedback</h2>
               
               {ticket.feedback ? (
                 <div className="space-y-4">
                   <div className="flex items-center gap-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <span key={star} className={star <= ticket.feedback!.rating ? "text-amber-400" : "text-slate-700"}>★</span>
                     ))}
                     <span className="text-xs font-bold text-slate-400 ml-2">Rating: {ticket.feedback.rating}/5</span>
                   </div>
                   {ticket.feedback.comment && (
                     <p className="text-xs text-slate-400 italic bg-white/5 p-3 rounded-lg border border-white/5">"{ticket.feedback.comment}"</p>
                   )}
                 </div>
               ) : isCreator ? (
                 <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rate our service</label>
                      <div className="flex items-center gap-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl transition-all ${star <= rating ? "text-amber-400 scale-110" : "text-slate-700 hover:text-slate-500"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Additional Comments</label>
                      <textarea
                        className="input-field min-h-[80px]"
                        placeholder="Any additional feedback..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                    <button type="submit" disabled={submittingFeedback} className="btn-primary px-8">
                       {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                    </button>
                 </form>
               ) : (
                 <p className="text-xs text-slate-500 italic">No feedback provided yet.</p>
               )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5 bg-black/40 space-y-5">
            <div className="space-y-4">
              <div className="pb-4 border-b border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Requester</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 font-bold text-xs">
                    {ticket.creator?.name?.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{ticket.creator?.name}</span>
                    <span className="text-[10px] text-slate-500 truncate">{ticket.creator?.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Priority</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ticket.priority === 'urgent' ? 'bg-red-500' : 'bg-primary'}`} />
                  <span className="text-xs font-bold text-slate-300 uppercase">{ticket.priority}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Submitted</p>
                <p className="text-xs font-bold text-slate-300">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Staff Actions */}
            {isStaff && ticket.status !== 'resolved' && (
              <div className="pt-5 border-t border-white/5 space-y-3">
                {ticket.status === 'open' ? (
                  <button onClick={() => handleStatusChange("in_progress")} className="btn-primary w-full py-2.5">Start Working</button>
                ) : (
                  <>
                    <button onClick={() => setShowResolveForm(true)} className="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full py-2.5">Mark as Resolved</button>
                    <button onClick={() => handleStatusChange("open")} className="btn-secondary w-full py-2 text-[11px]">Revert to Open</button>
                  </>
                )}
              </div>
            )}
          </div>

          {showResolveForm && (
            <div className="card p-5 bg-emerald-500/10 border-emerald-500/20 animate-fade-in space-y-4">
              <h3 className="text-sm font-bold text-white">Resolve Ticket</h3>
              <div className="space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solution Detail</label>
                 <textarea
                   required
                   className="input-field min-h-[120px]"
                   placeholder="Describe the solution..."
                   value={solution}
                   onChange={(e) => setSolution(e.target.value)}
                 />
              </div>
              <div className="flex gap-2">
                 <button onClick={handleResolve} disabled={resolving} className="btn-primary flex-1 py-2 text-xs">{resolving ? "Resolving..." : "Submit"}</button>
                 <button onClick={() => setShowResolveForm(false)} className="btn-secondary flex-1 py-2 text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
