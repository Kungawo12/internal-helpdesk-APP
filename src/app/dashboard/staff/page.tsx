"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";

export default function StaffQueuePage() {
  const router = useRouter();
  const { tickets, loading, error, refresh } = useTickets();
  const [solution, setSolution] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const activeTickets = useMemo(() => 
    tickets.filter(t => t.status === 'open' || t.status === 'in_progress'), 
  [tickets]);

  const resolvedTickets = useMemo(() => 
    tickets.filter(t => t.status === 'resolved'), 
  [tickets]);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/tickets/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
  };

  const handleResolve = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    await fetch(`/api/tickets/${id}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved", solution }),
    });
    setSolution("");
    setResolvingId(null);
    refresh();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Loading queue...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
      <div className="lg:col-span-3 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ticket Queue</h1>
            <p className="text-sm text-slate-500">Assigned service requests awaiting resolution</p>
          </div>
        </div>

        <div className="space-y-4">
          {activeTickets.length === 0 ? (
            <div className="card p-12 text-center bg-slate-50 border-dashed border-slate-200">
              <div className="text-4xl mb-4 text-slate-300">✨</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">All caught up!</h3>
              <p className="text-sm text-slate-500">No open tickets in your queue.</p>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <div key={ticket.id} className="card p-4 hover:border-blue-200 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-slate">{ticket.type}</span>
                      <span className={`badge ${ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{ticket.id.slice(0, 8)}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 pt-1">
                      <span>👤 {ticket.creator?.name}</span>
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.priority === 'urgent' && <span className="text-red-600 font-semibold">⚠️ Urgent</span>}
                      {ticket.priority === 'high' && <span className="text-amber-600">High Priority</span>}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 min-w-[120px]">
                    {ticket.status === 'open' && (
                      <button 
                        onClick={() => handleStatusChange(ticket.id, "in_progress")}
                        className="btn-primary w-full py-1.5 text-xs"
                      >
                        Start Working
                      </button>
                    )}
                    {ticket.status === 'in_progress' && resolvingId !== ticket.id && (
                      <button 
                        onClick={() => setResolvingId(ticket.id)}
                        className="btn-primary bg-green-600 hover:bg-green-700 w-full py-1.5 text-xs"
                      >
                        Resolve
                      </button>
                    )}
                    <button 
                      onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                      className="btn-secondary w-full py-1.5 text-xs"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {resolvingId === ticket.id && (
                  <form onSubmit={(e) => handleResolve(e, ticket.id)} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Resolution Solution</label>
                      <textarea
                        required
                        className="input-field min-h-[80px] text-sm"
                        placeholder="Explain how the issue was resolved..."
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary py-1.5 px-4 text-xs">Submit</button>
                      <button type="button" onClick={() => setResolvingId(null)} className="btn-secondary py-1.5 px-4 text-xs">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div className="card p-4 h-fit">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 pb-2 border-b border-slate-100">Recently Resolved</h2>
          <div className="space-y-2">
            {resolvedTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-colors" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                <p className="text-xs font-medium text-slate-900 truncate mb-1">{ticket.title}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-green-600 font-medium">Resolved</span>
                  <span className="text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-center py-4 text-xs text-slate-500">No recent resolutions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
