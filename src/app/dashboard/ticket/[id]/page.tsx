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
      body: JSON.stringify({ solution, status: "resolved" }),
    });
    setResolving(false);
    setShowResolveForm(false);
    refresh();
  };

  if (loading) return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-slate-500 text-xs font-medium">Loading ticket details...</p>
    </div>
  );

  if (error || !ticket) return (
    <div className="card p-8 text-center border-danger/20 bg-danger/5 max-w-md mx-auto mt-20">
      <p className="text-danger font-bold">Ticket Not Found</p>
      <p className="text-slate-500 text-xs mt-1">{error || "The ticket could not be found."}</p>
      <Link href="/dashboard" className="mt-4 inline-block text-xs font-bold text-primary hover:underline">
        Return to Dashboard
      </Link>
    </div>
  );

  const isCreator = session?.user.email === ticket.creator.email;
  const isStaff = session?.user.role === "it_staff" || session?.user.role === "hr_staff";

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Ticket ID: {ticket.id.slice(0, 12)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`badge ${
                ticket.priority === 'urgent' || ticket.priority === 'high' ? 'badge-red' : 
                ticket.priority === 'medium' ? 'badge-amber' : 'badge-blue'
              } text-[10px] py-0.5 px-2 font-bold uppercase`}>
                {ticket.priority}
              </span>
              <span className={`badge ${
                ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'
              } text-[10px] py-0.5 px-2 font-bold uppercase`}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className="badge badge-gray text-[10px] py-0.5 px-2 font-bold uppercase">{ticket.type}</span>
            </div>

            <h1 className="text-xl font-bold text-white mb-4 tracking-tight">
              {ticket.title}
            </h1>

            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                {ticket.description}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Submitted By</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-primary flex items-center justify-center font-bold text-white text-[10px]">
                    {ticket.creator.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{ticket.creator.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{ticket.creator.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned To</p>
                {ticket.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-[10px] border border-emerald-500/20">
                      {ticket.assignee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{ticket.assignee.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{ticket.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest py-1 italic opacity-40">Pending...</p>
                )}
              </div>
            </div>
          </div>

          {ticket.status === "resolved" && ticket.solution && (
            <div className="card p-5 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-400 text-sm">✅</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Resolution</h2>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="text-slate-300 leading-relaxed text-xs font-bold italic">
                  "{ticket.solution}"
                </p>
              </div>
              <p className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                Resolved {new Date(ticket.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {isStaff && (ticket.status === "open" || ticket.status === "in_progress") && (
            <div className="card p-5">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Actions</h2>
              <div className="space-y-2">
                {ticket.status === "open" && (
                  <button
                    onClick={() => handleStatusChange("in_progress")}
                    className="btn-primary w-full py-2 text-[11px] font-bold uppercase tracking-widest"
                  >
                    Start Working
                  </button>
                )}
                <button
                  onClick={() => setShowResolveForm(!showResolveForm)}
                  className={`w-full py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest border transition-all ${
                    showResolveForm 
                      ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {showResolveForm ? "Cancel" : "Resolve"}
                </button>
              </div>

              {showResolveForm && (
                <form onSubmit={handleResolve} className="mt-5 pt-5 border-t border-white/5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Solution</label>
                    <textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="input-field h-28 resize-none text-xs py-2"
                      placeholder="The fix was..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="btn-primary w-full py-2 text-[11px] font-bold uppercase tracking-widest"
                  >
                    {resolving ? "Saving..." : "Confirm Resolution"}
                  </button>
                </form>
              )}
            </div>
          )}

          {isCreator && ticket.status === "resolved" && (
            <div className="card p-5">
              {!ticket.feedback ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Rate Service</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Your feedback matters</p>
                  </div>
                  
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] border transition-all ${
                          rating === r 
                            ? "bg-primary border-primary text-white" 
                            : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comments</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input-field h-20 resize-none text-xs py-2"
                      placeholder="Optional details..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="btn-primary w-full py-2 text-[11px] font-bold uppercase tracking-widest"
                  >
                    {submittingFeedback ? "Sending..." : "Submit"}
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Your Feedback</h2>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-500 text-[10px]">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < ticket.feedback!.rating ? "opacity-100" : "opacity-10"}>★</span>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-white">{ticket.feedback.rating}/5</span>
                    </div>
                    {ticket.feedback.comment && (
                      <p className="text-slate-400 text-xs italic font-bold">
                        "{ticket.feedback.comment}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card p-5 space-y-3">
             <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeline</h3>
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <span className="text-[11px] font-bold text-slate-500 uppercase">Created</span>
                   <span className="text-[11px] text-slate-300 font-bold uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[11px] font-bold text-slate-500 uppercase">Updated</span>
                   <span className="text-[11px] text-slate-300 font-bold uppercase">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
