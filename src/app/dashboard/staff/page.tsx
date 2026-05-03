"use client";

import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTickets } from "@/hooks/useTickets";

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default function StaffDashboard() {
  const router = useRouter();
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
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-slate-500 text-xs font-medium">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">{ticketType} Ticket Queue</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {openTickets.length} active &middot; {resolvedTickets.length} resolved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            Active Tickets
          </h2>

          {openTickets.length === 0 ? (
            <div className="card p-6 text-center bg-white/[0.01]">
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">No open tickets</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openTickets.map((ticket) => (
                <div key={ticket.id} className="card p-4 hover:bg-white/[0.02] transition-colors border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge text-[11px] py-0.5 px-2 font-bold ${
                          ticket.priority === "urgent" || ticket.priority === "high" ? "badge-red" :
                          ticket.priority === "medium" ? "badge-amber" : "badge-blue"
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className={`badge text-[11px] py-0.5 px-2 font-bold ${
                          ticket.status === "in_progress" ? "badge-amber" : "badge-blue"
                        }`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>

                      <Link href={`/dashboard/ticket/${ticket.id}`} className="hover:text-primary transition-colors">
                        <h3 className="text-sm font-bold text-white">{ticket.title}</h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">{ticket.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                         <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {ticket.creator.name[0]}
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold">
                          {ticket.creator.name} &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ticket.status === "open" && (
                        <button
                          onClick={() => handleStatusChange(ticket.id, "in_progress")}
                          className="btn-primary py-1.5 px-3 text-xs font-bold"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => setResolveForm({ ticketId: ticket.id, solution: "" })}
                        className="btn-secondary py-1.5 px-3 text-xs font-bold"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>

                  {resolveForm?.ticketId === ticket.id && (
                    <div className="mt-4 p-4 bg-white/[0.03] border border-white/[0.08] rounded-lg space-y-3">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                        Resolution Details
                      </label>
                      <textarea
                        value={resolveForm.solution}
                        onChange={(e) => setResolveForm({ ...resolveForm, solution: e.target.value })}
                        className="input-field text-xs h-24 py-2"
                        placeholder="What was the fix?"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleResolve}
                          disabled={!resolveForm.solution.trim() || resolving}
                          className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-widest"
                        >
                          {resolving ? "Resolving..." : "Save Resolution"}
                        </button>
                        <button
                          onClick={() => setResolveForm(null)}
                          className="btn-secondary py-2 px-4 text-xs font-bold uppercase tracking-widest"
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

        <div className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Recently Resolved
          </h2>
          <div className="space-y-2">
            {resolvedTickets.slice(0, 10).map((ticket) => (
              <Link key={ticket.id} href={`/dashboard/ticket/${ticket.id}`} className="block group">
                <div className="card p-3 flex items-center justify-between hover:border-emerald-500/30 bg-white/[0.01] border-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[11px] text-slate-400 group-hover:text-emerald-400 transition-colors truncate">
                      {ticket.title}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-bold uppercase tracking-widest">
                      {ticket.creator.name.split(' ')[0]} &middot; {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {ticket.feedback && (
                    <div className="flex text-yellow-500 text-[10px] ml-2">
                      {"★".repeat(ticket.feedback.rating)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest italic opacity-40">Empty</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
