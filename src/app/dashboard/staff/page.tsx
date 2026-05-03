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
    <div className="min-h-[40vh] flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Syncing Queue...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in">
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h1 className="heading-prime text-2xl">Active Service Queue</h1>
            <p className="text-sm text-slate-400">Assigned service requests awaiting resolution</p>
          </div>
        </div>

        <div className="space-y-4">
          {activeTickets.length === 0 ? (
            <div className="card p-16 text-center bg-white/5 opacity-50 border-dashed">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-sm font-bold text-white mb-1 uppercase tracking-widest">No open tickets — all caught up!</p>
              <p className="text-xs text-slate-500">The service queue is currently clear.</p>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <div key={ticket.id} className="card p-5 bg-black/40 group hover:border-primary/30">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`badge ${ticket.type === 'IT' ? 'badge-blue' : 'badge-amber'}`}>
                        {ticket.type}
                      </span>
                      <span className={`badge ${ticket.status === 'in_progress' ? 'badge-blue' : 'badge-gray'}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 font-mono">#{ticket.id.slice(0, 8)}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>👤 {ticket.creator?.name}</span>
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span className={ticket.priority === 'urgent' ? 'text-red-400' : ''}>⚠️ {ticket.priority}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 min-w-[140px]">
                    {ticket.status === 'open' && (
                      <button 
                        onClick={() => handleStatusChange(ticket.id, "in_progress")}
                        className="btn-primary py-2 text-[11px]"
                      >
                        Start Working
                      </button>
                    )}
                    {ticket.status === 'in_progress' && resolvingId !== ticket.id && (
                      <button 
                        onClick={() => setResolvingId(ticket.id)}
                        className="btn-primary bg-emerald-600 hover:bg-emerald-700 py-2 text-[11px]"
                      >
                        Resolve Ticket
                      </button>
                    )}
                    <button 
                      onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                      className="btn-secondary py-2 text-[11px]"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {resolvingId === ticket.id && (
                  <form onSubmit={(e) => handleResolve(e, ticket.id)} className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolution Solution</label>
                      <textarea
                        required
                        className="input-field min-h-[100px]"
                        placeholder="Explain how the issue was resolved..."
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary flex-1 py-2 text-[11px]">Submit Resolution</button>
                      <button type="button" onClick={() => setResolvingId(null)} className="btn-secondary py-2 text-[11px]">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-5 bg-black/60 border-white/5 h-fit">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-3">Recently Resolved</h2>
          <div className="space-y-3">
            {resolvedTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                <p className="text-xs font-bold text-white truncate mb-1">{ticket.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Resolved</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-center py-4 text-[11px] text-slate-600 font-bold uppercase tracking-wider">No Resolved History</p>
            )}
          </div>
        </div>

        <div className="card p-5 bg-emerald-500/5 border-emerald-500/10">
          <h3 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Queue Policy</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Ensure all urgent priority tickets are addressed within 1 hour of assignment.
          </p>
        </div>
      </div>
    </div>
  );
}
