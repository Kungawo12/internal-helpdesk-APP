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

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveForm, setResolveForm] = useState<{
    ticketId: string;
    solution: string;
  } | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    // Sort by priority (urgent first) then by date
    data.sort((a: Ticket, b: Ticket) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setTickets(data);
    setLoading(false);
  };

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
      <div className="flex items-center justify-center py-20">
        <div className="text-slate-400">Loading queue...</div>
      </div>
    );
  }

  const ticketType = session?.user.role === "it_staff" ? "IT" : "HR";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{ticketType} Ticket Queue</h1>
        <p className="text-slate-400 mt-1">
          {openTickets.length} open · {resolvedTickets.length} resolved
        </p>
      </div>

      {/* Open Tickets */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full" />
          Active Tickets
        </h2>

        {openTickets.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-slate-500">
            <p className="text-3xl mb-2">🎉</p>
            <p>No open tickets — all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="card-glow bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ticket.priority === "urgent"
                            ? "bg-red-500/20 text-red-400"
                            : ticket.priority === "high"
                            ? "bg-orange-500/20 text-orange-400"
                            : ticket.priority === "medium"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ticket.status === "open"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-1">
                      {ticket.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-2">
                      {ticket.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted by{" "}
                      <span className="text-slate-300">
                        {ticket.creator.name}
                      </span>{" "}
                      ({ticket.creator.email}) ·{" "}
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {ticket.status === "open" && (
                      <button
                        onClick={() =>
                          handleStatusChange(ticket.id, "in_progress")
                        }
                        className="px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Start Working
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setResolveForm({
                          ticketId: ticket.id,
                          solution: "",
                        })
                      }
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                {/* Resolve Form */}
                {resolveForm?.ticketId === ticket.id && (
                  <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-3">
                    <label className="text-sm font-medium text-slate-300 block">
                      Solution
                    </label>
                    <textarea
                      value={resolveForm.solution}
                      onChange={(e) =>
                        setResolveForm({
                          ...resolveForm,
                          solution: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      rows={3}
                      placeholder="Describe the solution or steps taken to resolve this issue..."
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleResolve}
                        disabled={!resolveForm.solution || resolving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 rounded-lg text-sm font-medium transition-colors"
                      >
                        {resolving ? "Resolving..." : "Mark as Resolved"}
                      </button>
                      <button
                        onClick={() => setResolveForm(null)}
                        className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Tickets */}
      {resolvedTickets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            Resolved ({resolvedTickets.length})
          </h2>
          <div className="space-y-3">
            {resolvedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm text-slate-300">
                    {ticket.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {ticket.creator.name} ·{" "}
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {ticket.feedback && (
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(ticket.feedback.rating)}
                    {"☆".repeat(5 - ticket.feedback.rating)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
