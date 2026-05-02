"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Feedback state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Staff action state
  const [solution, setSolution] = useState("");
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ticket protocols");
      const data = await res.json();
      setTicket(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    await fetch(`/api/tickets/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setSubmittingFeedback(false);
    fetchTicket();
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/tickets/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTicket();
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
    fetchTicket();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !ticket) return <div className="p-20 text-center text-red-400">Error: {error || "Ticket not found"}</div>;

  const isCreator = session?.user.email === ticket.creator.email;
  const isStaff = session?.user.role === "it_staff" || session?.user.role === "hr_staff";

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/dashboard" className="btn-secondary px-6 py-2 text-sm">
          ← Back to Dashboard
        </Link>
        <span className="text-xs font-mono text-slate-600">ID: {ticket.id}</span>
      </div>

      <div className="space-y-8">
        {/* Main Ticket Card */}
        <div className="card p-8 md:p-12 shadow-2xl">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className={`badge ${
              ticket.priority === 'urgent' ? 'badge-red' : 
              ticket.priority === 'high' ? 'badge-red' : 'badge-blue'
            }`}>
              {ticket.priority} Priority
            </span>
            <span className={`badge ${
              ticket.status === 'resolved' ? 'badge-green' : 'badge-gray'
            }`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className="badge badge-gray">{ticket.type} Support</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            {ticket.title}
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Submitted By</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {ticket.creator.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{ticket.creator.name}</p>
                  <p className="text-xs text-slate-500">{ticket.creator.email}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Assigned Technician</p>
              {ticket.assignee ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400">
                    {ticket.assignee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{ticket.assignee.name}</p>
                    <p className="text-xs text-slate-500">{ticket.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">No technician assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Staff Actions Area */}
        {isStaff && (ticket.status === "open" || ticket.status === "in_progress") && (
          <div className="card p-8 border-primary/20 bg-primary/5">
            <h2 className="text-xl font-bold text-white mb-6">Staff Control Panel</h2>
            <div className="flex flex-wrap gap-4">
              {ticket.status === "open" && (
                <button
                  onClick={() => handleStatusChange("in_progress")}
                  className="btn-primary px-8"
                >
                  Start Working
                </button>
              )}
              <button
                onClick={() => setShowResolveForm(!showResolveForm)}
                className="btn-secondary bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white"
              >
                {showResolveForm ? "Cancel Resolution" : "Mark as Resolved"}
              </button>
            </div>

            {showResolveForm && (
              <form onSubmit={handleResolve} className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Resolution Description</label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    className="input-field h-40"
                    placeholder="Describe how the issue was fixed..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={resolving}
                  className="btn-primary w-full md:w-auto px-10"
                >
                  {resolving ? "Saving..." : "Confirm Resolution"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Resolution Display */}
        {ticket.status === "resolved" && ticket.solution && (
          <div className="card p-8 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">✅</span>
              <h2 className="text-xl font-bold text-emerald-400">Resolution Archive</h2>
            </div>
            <p className="text-slate-300 leading-relaxed italic">
              "{ticket.solution}"
            </p>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-6">
              Closed on {new Date(ticket.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Feedback Area (Employee View) */}
        {isCreator && ticket.status === "resolved" && (
          <div className="card p-8">
            {!ticket.feedback ? (
              <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                <h2 className="text-xl font-bold text-white">How was our service?</h2>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-400">Rate the resolution quality</p>
                  <div className="flex gap-4">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${
                          rating === r ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white/5 text-subtle hover:text-white"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">Additional Comments (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field h-32"
                    placeholder="Tell us more about your experience..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="btn-primary w-full md:w-auto px-12"
                >
                  {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Your Feedback</h2>
                <div className="flex items-center gap-4">
                  <div className="flex text-2xl text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < ticket.feedback!.rating ? "opacity-100" : "opacity-20"}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-500">({ticket.feedback.rating}/5 Rating)</span>
                </div>
                {ticket.feedback.comment && (
                  <p className="text-subtle italic bg-white/[0.02] p-4 rounded-xl border border-white/5">
                    "{ticket.feedback.comment}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
