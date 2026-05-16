"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTickets } from "@/hooks/useTickets";
import { timeAgo } from "@/lib/utils";
import SlaBadge from "@/components/ui/SlaBadge";



const getAvatarColor = (initial: string) => {
  const colors = [
    "bg-blue-100 text-blue-600",
    "bg-amber-100 text-amber-600",
    "bg-emerald-100 text-emerald-600",
    "bg-purple-100 text-purple-600",
    "bg-rose-100 text-rose-600"
  ];
  const index = initial.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function StaffQueuePage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const { tickets, loading, refresh } = useTickets({ status: statusFilter });
  const [solution, setSolution] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBulkClose = async () => {
    if (!confirm(`Are you sure you want to close ${selectedIds.length} tickets?`)) return;
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/tickets/${id}/resolve`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "closed", solution: "Bulk closed by staff" }),
          })
        )
      );
      setSelectedIds([]);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const activeTickets = useMemo(() => 
    tickets.filter(t => t.status === 'open' || t.status === 'in_progress'), 
  [tickets]);

  const resolvedTickets = useMemo(() => 
    tickets.filter(t => t.status === 'resolved'), 
  [tickets]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/tickets/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    try {
      await fetch(`/api/tickets/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved", solution }),
      });
      setSolution("");
      setResolvingId(null);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading queue...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in pb-32">
      <div className="lg:col-span-3 space-y-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 flex items-center flex-wrap gap-3 ">
              Staff Operations
              {activeTickets.length > 0 && (
                <span className="inline-flex items-center justify-center bg-red-500 text-slate-900 dark:text-white text-sm font-black rounded-full px-3 py-1 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  {activeTickets.length} awaiting
                </span>
              )}
            </h1>
            <div className="flex items-center gap-4">
              <p className="text-xl text-slate-500 dark:text-slate-400  font-medium">Assigned service requests awaiting resolution</p>
              {activeTickets.length > 0 && (
                <label className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400  font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === activeTickets.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(activeTickets.map(t => t.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-200 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  Select All
                </label>
              )}
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-blue-600 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl mb-6 page-reveal">
            <span className="text-sm font-bold">{selectedIds.length} selected</span>
            <button
              onClick={handleBulkClose}
              className="text-xs font-bold px-3 py-1.5 bg-white dark:bg-slate-900/20 rounded-lg transition-colors"
            >
              Close all
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 dark:text-white/50 ml-auto font-bold transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700  pb-2 overflow-x-auto">
          {[
            { value: "all", label: "All", count: tickets.length },
            { value: "open", label: "Open", count: tickets.filter(t => t.status === 'open').length },
            { value: "in_progress", label: "In Progress", count: tickets.filter(t => t.status === 'in_progress').length },
            { value: "resolved", label: "Resolved", count: tickets.filter(t => t.status === 'resolved').length },
            { value: "closed", label: "Closed", count: tickets.filter(t => t.status === 'closed').length },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 text-sm font-bold rounded-full transition-colors whitespace-nowrap flex items-center gap-2 ${
                statusFilter === tab.value
                  ? "bg-black text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === tab.value ? "bg-white dark:bg-slate-900/20 text-slate-900 dark:text-white" : "bg-slate-100 dark:bg-slate-800  text-slate-600 dark:text-slate-400 "}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTickets.length === 0 ? (
            <div className="card p-20 text-center bg-transparent border-dashed border-2 border-slate-200 dark:border-slate-700  shadow-none">
              <div className="text-6xl mb-4 opacity-30">🎉</div>
              <h3 className="text-2xl font-bold mb-2 ">All caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400 ">No open tickets in your queue.</p>
            </div>
          ) : (
            activeTickets.map((ticket) => (
              <div key={ticket.id} className={`card p-6 group relative border-l-4 ${
                ticket.type === 'IT' ? 'border-l-blue-500' :
                ticket.type === 'HR' ? 'border-l-amber-500' :
                ticket.type === 'Software' ? 'border-l-purple-500' : 'border-l-slate-300'
              } ${
                ticket.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-white dark:bg-slate-800'
              } ${
                ticket.priority === 'urgent' ? 'border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : ''
              }`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ticket.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, ticket.id]);
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== ticket.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-200 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`badge !px-3 !py-1 ${
                        ticket.type === 'IT' ? 'badge-blue' :
                        ticket.type === 'HR' ? 'badge-amber' :
                        ticket.type === 'Software' ? 'badge-purple' : 'badge-slate'
                      }`}>{ticket.type}</span>
                      <span className={`badge !px-3 !py-1 ${ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                      <SlaBadge ticket={ticket} />
                      <span className="text-sm text-slate-500 dark:text-slate-400  font-mono font-bold uppercase">#{ticket.id.slice(0, 8)}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold cursor-pointer transition-colors " onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                        {ticket.title}
                      </h3>
                      <p className="text-lg text-slate-500 dark:text-slate-400  mt-2 line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-black/60  pt-2">
                      <span className="flex items-center gap-2">
                        {(() => {
                          const initial = ticket.creator?.name?.charAt(0) || '?';
                          return (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarColor(initial)}`}>
                              {initial}
                            </div>
                          );
                        })()}
                        {ticket.creator?.name}
                      </span>
                      <span>{timeAgo(ticket.createdAt)}</span>
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
                        className="btn-primary bg-green-600 w-full py-3 text-sm"
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
                  <form onSubmit={(e) => handleResolve(e, ticket.id)} className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700  space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold tracking-tight ">Resolution Solution</label>
                      <textarea
                        required
                        className="input-field    min-h-[120px] text-lg"
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
        <div className="card p-8 h-fit bg-[#f4f4f4]  ">
          <h2 className="text-xl font-bold tracking-tight mb-6 pb-4 border-b border-slate-200 dark:border-slate-700  ">Recently Resolved</h2>
          <div className="space-y-4">
            {resolvedTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 cursor-pointer transition-colors shadow-sm" onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}>
                <p className="text-sm font-bold truncate mb-2 ">{ticket.title}</p>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-green-600">Resolved</span>
                  <span className="text-slate-500 dark:text-slate-400 ">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {resolvedTickets.length === 0 && (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">No recent resolutions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
