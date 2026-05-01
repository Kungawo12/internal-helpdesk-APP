"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  solution: string | null;
  createdAt: string;
  creator?: { name: string; email: string };
  assignee?: { name: string; email: string } | null;
  feedback?: { rating: number; comment: string | null } | null;
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-yellow-500/20 text-yellow-400",
  resolved: "bg-emerald-500/20 text-emerald-400",
  closed: "bg-slate-500/20 text-slate-400",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-500/20 text-slate-400",
  medium: "bg-blue-500/20 text-blue-400",
  high: "bg-orange-500/20 text-orange-400",
  urgent: "bg-red-500/20 text-red-400",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackForm, setFeedbackForm] = useState<{
    ticketId: string;
    rating: number;
    comment: string;
  } | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data);
    setLoading(false);
  };

  const submitFeedback = async () => {
    if (!feedbackForm) return;

    await fetch(`/api/tickets/${feedbackForm.ticketId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: feedbackForm.rating,
        comment: feedbackForm.comment || null,
      }),
    });

    setFeedbackForm(null);
    fetchTickets();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {session?.user.role === "employee"
              ? "My Tickets"
              : session?.user.role === "manager"
              ? "All Company Tickets"
              : `${session?.user.role === "it_staff" ? "IT" : "HR"} Tickets`}
          </h1>
          <p className="text-slate-400 mt-1">
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {(session?.user.role === "employee" ||
          session?.user.role === "manager") && (
          <a
            href="/dashboard/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-sm transition-colors"
          >
            + New Ticket
          </a>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-4">🎫</p>
          <p className="text-lg font-medium">No tickets yet</p>
          <p className="text-sm mt-1">
            {session?.user.role === "employee"
              ? "Create your first ticket to get started"
              : "No tickets to display"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="card-glow bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.05] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}
                    >
                      {ticket.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.06] text-slate-300">
                      {ticket.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{ticket.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {ticket.description}
                  </p>

                  {ticket.solution && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-xs font-medium text-emerald-400 mb-1">
                        Solution
                      </p>
                      <p className="text-sm text-slate-300">
                        {ticket.solution}
                      </p>
                    </div>
                  )}

                  {ticket.feedback && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Your rating:
                      </span>
                      <span className="text-yellow-400 text-sm">
                        {"★".repeat(ticket.feedback.rating)}
                        {"☆".repeat(5 - ticket.feedback.rating)}
                      </span>
                    </div>
                  )}

                  {ticket.status === "resolved" &&
                    !ticket.feedback &&
                    session?.user.role === "employee" && (
                      <div className="mt-4">
                        {feedbackForm?.ticketId === ticket.id ? (
                          <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-3">
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">
                                Rating
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() =>
                                      setFeedbackForm({
                                        ...feedbackForm,
                                        rating: star,
                                      })
                                    }
                                    className={`text-xl ${
                                      star <= feedbackForm.rating
                                        ? "text-yellow-400"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 block mb-1">
                                Comment (optional)
                              </label>
                              <textarea
                                value={feedbackForm.comment}
                                onChange={(e) =>
                                  setFeedbackForm({
                                    ...feedbackForm,
                                    comment: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                rows={2}
                                placeholder="Share your experience..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={submitFeedback}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium transition-colors"
                              >
                                Submit
                              </button>
                              <button
                                onClick={() => setFeedbackForm(null)}
                                className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setFeedbackForm({
                                ticketId: ticket.id,
                                rating: 5,
                                comment: "",
                              })
                            }
                            className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium transition-colors"
                          >
                            Leave Feedback
                          </button>
                        )}
                      </div>
                    )}
                </div>

                <div className="text-right flex-shrink-0">
                  {ticket.creator && (
                    <p className="text-xs text-slate-500">
                      by {ticket.creator.name}
                    </p>
                  )}
                  {ticket.assignee && (
                    <p className="text-xs text-slate-500 mt-1">
                      Assigned: {ticket.assignee.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
