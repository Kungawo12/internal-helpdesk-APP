"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-subtle text-sm font-medium">Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Tickets</h1>
          <p className="text-subtle mt-1">Track and manage your active requests</p>
        </div>
        <Link href="/dashboard/create" className="btn-primary">
          Create New Ticket
        </Link>
      </div>

      <div className="space-y-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`badge ${
                    ticket.priority === 'urgent' ? 'badge-red' : 
                    ticket.priority === 'high' ? 'badge-red' : 
                    'badge-blue'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`badge ${
                    ticket.status === 'resolved' ? 'badge-green' : 'badge-gray'
                  }`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="text-xs font-medium text-slate-600">ID: {ticket.id.slice(0, 8)}</span>
                </div>

                <h2 className="text-xl font-bold text-white mb-3">{ticket.title}</h2>
                <p className="text-subtle text-sm leading-relaxed mb-6">
                  {ticket.description}
                </p>

                <div className="flex items-center gap-6 text-[12px] font-medium text-slate-500">
                   <span>Opened on {new Date(ticket.createdAt).toLocaleDateString()}</span>
                   <div className="w-1 h-1 bg-slate-800 rounded-full" />
                   <span>Type: {ticket.type}</span>
                </div>
              </div>

              <div className="md:w-72">
                {ticket.status === "resolved" && (
                  <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/10">
                    <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Resolution</h3>
                    <p className="text-sm text-slate-300 italic mb-4">"{ticket.solution}"</p>
                    
                    {!ticket.feedback ? (
                      <button 
                        onClick={() => setFeedbackForm({ ticketId: ticket.id, rating: 5, comment: "" })}
                        className="w-full py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold rounded-lg hover:bg-green-500 hover:text-white transition-all"
                      >
                        Rate Resolution
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < ticket.feedback!.rating ? "opacity-100" : "opacity-20"}>★</span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">Rated</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Feedback Modal-like Form */}
            {feedbackForm?.ticketId === ticket.id && (
              <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-sm font-bold text-white mb-6">How was the resolution?</h3>
                <div className="flex gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: r })}
                      className={`w-10 h-10 rounded-lg font-bold transition-all ${
                        feedbackForm.rating === r ? "bg-primary text-white" : "bg-white/5 text-subtle hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  className="input-field h-24 mb-6"
                  placeholder="Additional comments (optional)"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={submittingFeedback}
                    className="btn-primary py-2.5 px-6"
                  >
                    {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </button>
                  <button
                    onClick={() => setFeedbackForm(null)}
                    className="btn-secondary py-2.5 px-6"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {tickets.length === 0 && (
          <div className="card p-20 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-subtle font-medium">You haven't created any tickets yet.</p>
            <Link href="/dashboard/create" className="text-primary hover:underline mt-2 inline-block font-bold">
              Create your first ticket
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
