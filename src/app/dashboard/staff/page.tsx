"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function StaffDashboard() {
  const { data: session } = useSession();
  const { tickets, loading, error, refresh } = useTickets();
  const [resolveForm, setResolveForm] = useState<{
    ticketId: string;
    solution: string;
  } | null>(null);
  const [resolving, setResolving] = useState(false);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tickets]);

  const handleStatusChange = async (ticketId: string, status: string) => {
    await fetch(`/api/tickets/${ticketId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  };

  const handleResolve = async () => {
    if (!resolveForm || !resolveForm.solution.trim()) return;
    setResolving(true);

    await fetch(`/api/tickets/${resolveForm.ticketId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solution: resolveForm.solution, status: "resolved" }),
    });

    setResolving(false);
    setResolveForm(null);
    refresh();
  };

  const openTickets = sortedTickets.filter((t) => t.status === "open" || t.status === "in_progress");
  const resolvedTickets = sortedTickets.filter((t) => t.status === "resolved" || t.status === "closed");

  const ticketType = session?.user.role === "it_staff" ? "IT" : "HR";

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-subtle text-sm">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{ticketType} Ticket Queue</h1>
          <p className="text-subtle text-sm mt-1">
            {openTickets.length} active &middot; {resolvedTickets.length} resolved
          </p>
        </div>
      </div>

      {/* Active Tickets */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full" />
          Active Tickets
        </h2>

        {openTickets.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-subtle font-medium">All caught up — no open tickets!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {openTickets.map((ticket) => (
              <div key={ticket.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge text-[11px] ${
                        ticket.priority === "urgent" ? "badge-red" :
                        ticket.priority === "high" ? "badge-red" :
                        ticket.priority === "medium" ? "badge-amber" : "badge-gray"
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className={`badge text-[11px] ${
                        ticket.status === "in_progress" ? "badge-amber" : "badge-blue"
                      }`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <Link href={`/dashboard/ticket/${ticket.id}`} className="hover:text-primary transition-colors">
                      <h3 className="text-base font-semibold text-white">{ticket.title}</h3>
                    </Link>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{ticket.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {ticket.creator.name} ({ticket.creator.email}) &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {ticket.status === "open" && (
                      <button
                        onClick={() => handleStatusChange(ticket.id, "in_progress")}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Start Working
                      </button>
                    )}
                    <button
                      onClick={() => setResolveForm({ ticketId: ticket.id, solution: "" })}
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
                      onChange={(e) => setResolveForm({ ...resolveForm, solution: e.target.value })}
                      className="input-field text-sm"
                      rows={3}
                      placeholder="Describe what you did to resolve this issue..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleResolve}
                        disabled={!resolveForm.solution.trim() || resolving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        {resolving ? "Resolving..." : "Mark as Resolved"}
                      </button>
                      <button
                        onClick={() => setResolveForm(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
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
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            Resolved ({resolvedTickets.length})
          </h2>
          <div className="space-y-2">
            {resolvedTickets.map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/ticket/${ticket.id}`} className="block group">
                <div className="card p-4 flex items-center justify-between hover:border-emerald-500/30">
                  <div>
                    <p className="font-medium text-sm text-slate-300 group-hover:text-emerald-400 transition-colors">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ticket.creator.name} &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {ticket.feedback && (
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(ticket.feedback.rating)}{"☆".repeat(5 - ticket.feedback.rating)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
