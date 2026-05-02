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
  open: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  in_progress: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  closed: "text-slate-500 bg-white/5 border-white/10",
};

const priorityIcons: Record<string, string> = {
  low: "○",
  medium: "◔",
  high: "◕",
  urgent: "●",
};

const priorityColors: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-blue-400",
  high: "text-orange-400",
  urgent: "text-red-500",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Initializing Workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header & Command Bar */}
      <div className="flex flex-col gap-10 mb-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              {session?.user.role === "employee" ? "Employee Portal" : "Operations Hub"}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Logged in as <span className="text-slate-300">{session?.user.name}</span> • {session?.user.role.replace('_', ' ')}
            </p>
          </div>
          <a
            href="/dashboard/create"
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            + Create Ticket
          </a>
        </div>

        {/* Bento Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2 lg:col-span-2 p-8 glass rounded-[32px] border-white/5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Search & Command</p>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Find a ticket, article, or team member..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">🔍</span>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-500 font-mono">K</kbd>
                </div>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-all duration-700" />
          </div>

          <div className="p-8 glass rounded-[32px] border-white/5 flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Tickets</p>
            <div>
              <p className="text-4xl font-black text-white">{tickets.filter(t => t.status !== 'closed').length}</p>
              <p className="text-xs text-emerald-500 mt-1">↑ 12% from last week</p>
            </div>
          </div>

          <div className="p-8 glass rounded-[32px] border-white/5 flex flex-col justify-between bg-gradient-to-br from-primary/10 to-transparent">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Resolution</p>
            <div>
              <p className="text-4xl font-black text-white">1.8h</p>
              <p className="text-xs text-slate-500 mt-1">Global average: 2.4h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket List - Linear Style */}
      <div className="glass rounded-[32px] border-white/5 overflow-hidden">
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex gap-6">
            <button className="text-sm font-bold text-white relative py-1">
              All Tickets
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            </button>
            <button className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors py-1">Recent</button>
            <button className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors py-1">Resolved</button>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center glass border-white/10 rounded-lg text-xs hover:bg-white/5">⌥</button>
            <button className="w-8 h-8 flex items-center justify-center glass border-white/10 rounded-lg text-xs hover:bg-white/5">⌘</button>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <p className="text-slate-600 font-medium mb-1">No tickets match your filter</p>
            <button onClick={() => setSearchQuery("")} className="text-xs text-primary font-bold">Clear search</button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="group flex flex-col md:flex-row items-start md:items-center px-8 py-5 hover:bg-white/[0.03] transition-all gap-4 md:gap-8"
              >
                {/* Meta Icons */}
                <div className="flex items-center gap-4 min-w-[100px]">
                  <span className={`text-sm font-bold ${priorityColors[ticket.priority]}`}>
                    {priorityIcons[ticket.priority]}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter tabular-nums">
                    {ticket.id.slice(0, 7).toUpperCase()}
                  </span>
                </div>

                {/* Title & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-slate-200 truncate group-hover:text-primary transition-colors">
                      {ticket.title}
                    </h3>
                    {ticket.type === "HR" && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest border border-purple-500/20">HR</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Status & Assignment */}
                <div className="flex items-center gap-6 ml-auto">
                  <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${statusColors[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </div>
                  
                  <div className="flex items-center -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold" title={`Created by ${ticket.creator?.name}`}>
                      {ticket.creator?.name.charAt(0)}
                    </div>
                    {ticket.assignee && (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-slate-400" title={`Assigned to ${ticket.assignee.name}`}>
                        {ticket.assignee.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest tabular-nums w-20 text-right">
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="mt-10 flex items-center justify-center gap-10">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">N</kbd> New Ticket
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">/</kbd> Focus Search
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">ESC</kbd> Close View
        </div>
      </div>
    </div>
  );
}
