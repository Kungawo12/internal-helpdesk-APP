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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
        <span className="text-[11px] font-mono text-slate-600">ID: {ticket.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`badge ${
                ticket.priority === 'urgent' || ticket.priority === 'high' ? 'badge-red' : 
                ticket.priority === 'medium' ? 'badge-amber' : 'badge-blue'
              } text-[11px] py-0.5 px-2`}>
                {ticket.priority} Priority
              </span>
              <span className={`badge ${
                ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'
              } text-[11px] py-0.5 px-2`}>
                {ticket.status.replace("_", " ")}
              </span>
              <span className="badge badge-gray text-[11px] py-0.5 px-2">{ticket.type}</span>
            </div>

            <h1 className="text-2xl font-bold text-white mb-6 tracking-tight">
              {ticket.title}
            </h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {ticket.description}
              </p>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submitted By</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-primary text-xs border border-white/5">
                    {ticket.creator.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">{ticket.creator.name}</p>
                    <p className="text-xs text-slate-500">{ticket.creator.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned To</p>
                {ticket.assignee ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs border border-emerald-500/10">
                      {ticket.assignee.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{ticket.assignee.name}</p>
                      <p className="text-xs text-slate-500">{ticket.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-medium italic py-1">Pending assignment...</p>
                )}
              </div>
            </div>
          </div>

          {ticket.status === "resolved" && ticket.solution && (
            <div className="card p-6 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-emerald-400">✅</span>
                <h2 className="text-lg font-bold text-white">Resolution</h2>
              </div>
              <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="text-slate-300 leading-relaxed text-sm font-medium italic">
                  "{ticket.solution}"
                </p>
              </div>
              <p className="mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                Resolved on {new Date(ticket.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isStaff && (ticket.status === "open" || ticket.status === "in_progress") && (
            <div className="card p-6">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Actions</h2>
              <div className="space-y-3">
                {ticket.status === "open" && (
                  <button
                    onClick={() => handleStatusChange("in_progress")}
                    className="btn-primary w-full py-2 text-xs"
                  >
                    Start Working
                  </button>
                )}
                <button
                  onClick={() => setShowResolveForm(!showResolveForm)}
                  className={`w-full py-2 rounded-lg font-bold text-xs border transition-all ${
                    showResolveForm 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {showResolveForm ? "Cancel" : "Mark as Resolved"}
                </button>
              </div>

              {showResolveForm && (
                <form onSubmit={handleResolve} className="mt-6 pt-6 border-t border-white/5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solution Details</label>
                    <textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="input-field h-32 resize-none text-xs"
                      placeholder="What was the fix?"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="btn-primary w-full py-2 text-xs"
                  >
                    {resolving ? "Saving..." : "Save Resolution"}
                  </button>
                </form>
              )}
            </div>
          )}

          {isCreator && ticket.status === "resolved" && (
            <div className="card p-6">
              {!ticket.feedback ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-white">Rate Service</h2>
                    <p className="text-xs text-slate-500">How was your experience?</p>
                  </div>
                  
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs border transition-all ${
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
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Comments</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input-field h-24 resize-none text-xs"
                      placeholder="Optional feedback..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="btn-primary w-full py-2 text-xs"
                  >
                    {submittingFeedback ? "Sending..." : "Submit Feedback"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-white">Your Feedback</h2>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-500 text-xs">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < ticket.feedback!.rating ? "opacity-100" : "opacity-10"}>★</span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white">{ticket.feedback.rating}/5</span>
                    </div>
                    {ticket.feedback.comment && (
                      <p className="text-slate-400 text-xs italic">
                        "{ticket.feedback.comment}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card p-6 space-y-4">
             <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket Details</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-500">Created</span>
                   <span className="text-xs text-slate-300 font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-500">Updated</span>
                   <span className="text-xs text-slate-300 font-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-slate-500">Department</span>
                   <span className="text-xs text-slate-300 font-medium">{ticket.type}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
