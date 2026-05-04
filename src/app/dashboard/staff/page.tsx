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
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in pb-32">
      <div className="lg:col-span-3 space-y-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Staff Operations</h1>
            <p className="text-xl text-[#6e6e73] font-medium">Assigned service requests awaiting resolution</p>
          </div>
        </div>

        <div className="space-y-6">
          {activeTickets.length === 0 ? (
            <div className="card p-20 text-center bg-transparent border-dashed border-2 border-black/10 shadow-none">
              <h3 className="text-2xl font-bold mb-2">All caught up!</h3>
              <p className="text-[#6e6e73]">No open tickets in your queue.</p>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <div key={ticket.id} className="card p-8 group hover:bg-[#fafafa]">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="badge badge-slate !px-3 !py-1">{ticket.type}</span>
                      <span className={`badge !px-3 !py-1 ${ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span className="text-sm text-[#6e6e73] font-mono font-bold uppercase">#{ticket.id.slice(0, 8)}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold cursor-pointer group-hover:text-blue-600 transition-colors" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                        {ticket.title}
                      </h3>
                      <p className="text-lg text-[#6e6e73] mt-2 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-black/60 pt-2">
                      <span className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">{ticket.creator?.name?.charAt(0) || '?'}</div> {ticket.creator?.name}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket.priority === 'urgent' && <span className="text-red-500 font-extrabold flex items-center gap-1"><span className="text-xl leading-none">!</span> URGENT</span>}
                      {ticket.priority === 'high' && <span className="text-amber-600 font-extrabold">HIGH PRIORITY</span>}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 min-w-[140px] mt-6 md:mt-0">
                    {ticket.status === 'open' && (
                      <button 
                        onClick={() => handleStatusChange(ticket.id, "in_progress")}
                        className="btn-primary w-full py-3 text-sm"
                      >
                        Start Working
                      </button>
                    )}
                    {ticket.status === 'in_progress' && resolvingId !== ticket.id && (
                      <button 
                        onClick={() => setResolvingId(ticket.id)}
                        className="btn-primary bg-green-600 hover:bg-green-700 hover:scale-105 w-full py-3 text-sm"
                      >
                        Resolve Issue
                      </button>
                    )}
                    <button 
                      onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                      className="btn-secondary w-full py-3 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {resolvingId === ticket.id && (
                  <form onSubmit={(e) => handleResolve(e, ticket.id)} className="mt-8 pt-8 border-t border-black/10 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold tracking-tight">Resolution Solution</label>
                      <textarea
                        required
                        className="input-field min-h-[120px] text-lg"
                        placeholder="Explain how the issue was resolved..."
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary py-3 px-8 text-sm">Submit Resolution</button>
                      <button type="button" onClick={() => setResolvingId(null)} className="btn-secondary py-3 px-8 text-sm">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-8 mt-12 lg:mt-0">
        <div className="card p-8 h-fit bg-[#f4f4f4]">
          <h2 className="text-xl font-bold tracking-tight mb-6 pb-4 border-b border-black/10">Recently Resolved</h2>
          <div className="space-y-4">
            {resolvedTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-4 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                <p className="text-sm font-bold truncate mb-2">{ticket.title}</p>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-green-600">Resolved</span>
                  <span className="text-[#6e6e73]">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-center py-8 text-[#6e6e73] font-medium">No recent resolutions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
