"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTicket } from "@/hooks/useTicket";
import Link from "next/link";

type TicketDetail = {
  id: string;
  title: string;
  description: string;
  type: "IT" | "HR";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  solution: string | null;
  createdAt: string;
  updatedAt: string;
  creator: { name: string; email: string };
  assignee: { name: string; email: string } | null;
  feedback: { id: string; rating: number; comment: string | null } | null;
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const { ticket, loading, error, refresh } = useTicket(id as string);
  
  // Feedback state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Staff action state
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
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-subtle font-medium animate-pulse">Loading ticket protocols...</p>
    </div>
  );

  if (error || !ticket) return (
    <div className="max-w-2xl mx-auto py-20 text-center animate-fade-in">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-white mb-2">Ticket Not Found</h1>
      <p className="text-slate-400 mb-8">{error || "The requested ticket could not be located."}</p>
      <Link href="/dashboard" className="btn-primary px-8">Return to Dashboard</Link>
    </div>
  );

  const isCreator = session?.user.email === ticket.creator.email;
  const isStaff = session?.user.role === "it_staff" || session?.user.role === "hr_staff";

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-fade-in">
      <div className="mb-12 flex items-center justify-between">
        <Link href="/dashboard" className="btn-secondary flex items-center gap-2 group">
          <span className="transition-transform group-hover:-translate-x-1">←</span> 
          Back to Overview
        </Link>
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
          ID: {ticket.id}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Content Card */}
          <div className="card p-10 md:p-14 relative overflow-hidden">
            {/* Subtle Gradient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <span className={`badge ${
                  ticket.priority === 'urgent' ? 'badge-red' : 
                  ticket.priority === 'high' ? 'badge-red' : 
                  ticket.priority === 'medium' ? 'badge-amber' : 'badge-blue'
                }`}>
                  {ticket.priority} Priority
                </span>
                <span className={`badge ${
                  ticket.status === 'resolved' ? 'badge-green' : 'badge-blue'
                }`}>
                  {ticket.status.replace("_", " ")}
                </span>
                <span className="badge badge-gray">{ticket.type}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                {ticket.title}
              </h1>

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {ticket.description}
                </p>
              </div>

              <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submitted By</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xl border border-primary/20">
                      {ticket.creator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{ticket.creator.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{ticket.creator.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned To</p>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xl border border-emerald-500/20">
                        {ticket.assignee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{ticket.assignee.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{ticket.assignee.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-sm text-slate-500 font-medium italic">
                      Pending assignment...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Display */}
          {ticket.status === "resolved" && ticket.solution && (
            <div className="card p-10 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 text-4xl group-hover:scale-110 transition-transform">✅</div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Resolution</h2>
              </div>
              <div className="bg-black/20 p-8 rounded-2xl border border-white/5">
                <p className="text-slate-200 leading-relaxed text-lg font-medium italic">
                  "{ticket.solution}"
                </p>
              </div>
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">Case Resolved</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Closed {new Date(ticket.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Action Sidebar */}
          {isStaff && (ticket.status === "open" || ticket.status === "in_progress") && (
            <div className="card p-8 border-primary/20 bg-primary/5">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-primary rounded-full" />
                Staff Actions
              </h2>
              <div className="space-y-4">
                {ticket.status === "open" && (
                  <button
                    onClick={() => handleStatusChange("in_progress")}
                    className="btn-primary w-full"
                  >
                    Start Investigation
                  </button>
                )}
                <button
                  onClick={() => setShowResolveForm(!showResolveForm)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all border ${
                    showResolveForm 
                      ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {showResolveForm ? "Cancel Resolution" : "Mark as Resolved"}
                </button>
              </div>

              {showResolveForm && (
                <form onSubmit={handleResolve} className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-fade-in">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Internal Report</label>
                    <textarea
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      className="input-field h-48 resize-none"
                      placeholder="Detail the steps taken to resolve this ticket..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resolving}
                    className="btn-primary w-full"
                  >
                    {resolving ? "Resolving..." : "Resolve Ticket"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Feedback Section (Employee View) */}
          {isCreator && ticket.status === "resolved" && (
            <div className="card p-8 relative overflow-hidden">
              {!ticket.feedback ? (
                <form onSubmit={handleFeedbackSubmit} className="space-y-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2">Service Quality</h2>
                    <p className="text-sm text-slate-500 font-medium">How would you rate our resolution?</p>
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`flex-1 h-14 rounded-2xl font-black text-lg transition-all border ${
                          rating === r 
                            ? "bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/20" 
                            : "bg-white/5 border-white/5 text-slate-500 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Your Experience</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input-field h-32 resize-none"
                      placeholder="Any additional comments?"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="btn-primary w-full"
                  >
                    {submittingFeedback ? "Submitting..." : "Send Feedback"}
                  </button>
                </form>
              ) : (
                <div className="space-y-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black text-white mb-2">Your Review</h2>
                    <p className="text-sm text-slate-500 font-medium">Thank you for your feedback!</p>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex gap-1 text-2xl text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < ticket.feedback!.rating ? "opacity-100" : "opacity-10"}>★</span>
                        ))}
                      </div>
                      <span className="text-lg font-black text-white">{ticket.feedback.rating}/5</span>
                    </div>
                    {ticket.feedback.comment && (
                      <p className="text-slate-300 font-medium italic border-l-2 border-primary/30 pl-4 py-1">
                        "{ticket.feedback.comment}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ticket Stats Sidebar */}
          <div className="card p-8 space-y-6">
             <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Ticket Meta</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-sm text-slate-400 font-medium">Created</span>
                   <span className="text-sm text-white font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-slate-400 font-medium">Last Update</span>
                   <span className="text-sm text-white font-bold">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-sm text-slate-400 font-medium">Department</span>
                   <span className="text-sm text-white font-bold">{ticket.type}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
