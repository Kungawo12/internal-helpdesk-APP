"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTickets } from "@/hooks/useTickets";
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { tickets: allTickets, loading, error } = useTickets();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("dismissedOnboardingBanner");
    if (!dismissed && role === "employee") {
      setShowBanner(true);
    }
  }, [role]);

  const stats = useMemo(() => ({
    total: allTickets.length,
    open: allTickets.filter(t => t.status === 'open').length,
    inProgress: allTickets.filter(t => t.status === 'in_progress').length,
    resolved: allTickets.filter(t => t.status === 'resolved').length,
  }), [allTickets]);

  const tickets = useMemo(() => {
    return allTickets.filter(t => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allTickets, statusFilter, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-[4px] border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4 font-bold text-xl">System Error. Re-initialize connection.</p>
      </div>
    );
  }

  const statsList = [
    { label: "Total Tracking", value: stats.total, style: "bg-black text-white", icon: "🎫", iconBg: "bg-white/10" },
    { label: "Needs Action", value: stats.open, style: "bg-white  text-black ", icon: "🔴", iconBg: "bg-red-50 " },
    { label: "In Progress", value: stats.inProgress, style: "bg-blue-600 text-white", icon: "⚡", iconBg: "bg-white/10" },
    { label: "Resolved", value: stats.resolved, style: "bg-white  text-black ", icon: "✅", iconBg: "bg-emerald-50 " },
  ];

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-32">
      {showBanner && (
        <div className="bg-blue-50  border border-blue-200  rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10"
               style={{backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80')"}} />
          <div className="relative z-10">
            <button 
              onClick={() => {
                localStorage.setItem("dismissedOnboardingBanner", "true");
                setShowBanner(false);
              }}
              className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 "
            >
              ✕
            </button>
            <h3 className="font-bold text-blue-800  mb-2">👋 Welcome to Helpdesk!</h3>
            <p className="text-sm text-blue-700  mb-1">Need IT help? → Click <strong>IT Ticket</strong> above</p>
            <p className="text-sm text-blue-700  mb-1">Have a question? → Go to <strong>Knowledge Base</strong></p>
            <p className="text-sm text-blue-700 ">Track your requests → Scroll down</p>
          </div>
        </div>
      )}
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge badge-slate   !px-4 !py-2 !text-sm">Employee Portal</span>
            <span className="text-sm font-semibold text-[#6e6e73] ">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight ">Welcome back,<br/>{session?.user?.name?.split(' ')[0] || "User"}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {role === "employee" && (
            <>
              <Link href="/dashboard/create?type=IT" className="btn-primary !px-8 !py-3 text-base flex items-center gap-2">
                🖥️ IT Ticket
              </Link>
              <Link href="/dashboard/create?type=HR" className="btn-primary !px-8 !py-3 text-base flex items-center gap-2 bg-slate-700 hover:bg-slate-800">
                👥 HR Ticket
              </Link>
            </>
          )}
          {role === "admin" && (
            <Link href="/admin" className="btn-primary !px-6 !py-3 text-sm flex items-center gap-2 bg-red-700 hover:bg-red-600">
              🔐 Admin Portal
            </Link>
          )}
        </div>
      </div>

      {/* Massive KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in delay-100">
        {statsList.map((s, idx) => (
          <div key={idx} className={`card p-8 relative overflow-hidden ${s.style}`}>
            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center text-xl`}>{s.icon}</div>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">{s.label}</p>
            <p className="text-6xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 animate-fade-in delay-200">
        <div className="h-px bg-slate-200  flex-1" />
        <span className="text-xs font-bold text-slate-400  uppercase tracking-widest">Today&apos;s Activity</span>
        <div className="h-px bg-slate-200  flex-1" />
      </div>

      {/* Ticket Cards Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in delay-300">
        {/* Left Column - Active Stream */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-3xl font-extrabold tracking-tight ">Active Stream</h2>
            <div className="flex w-full md:w-auto gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field    max-w-xs"
              />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field    max-w-[160px]"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in_progress">Working</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {tickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket) => {
                let borderClass = "";
                if (ticket.status === "open") borderClass = "ticket-card-open";
                if (ticket.status === "in_progress") borderClass = "ticket-card-progress";
                if (ticket.status === "resolved") borderClass = "ticket-card-resolved";

                return (
                  <div 
                    key={ticket.id} 
                    onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                    className={`card p-6 cursor-pointer group hover:bg-[#fafafa]    relative ${borderClass}`}
                  >
                    <div className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full ${
                      ticket.priority === 'urgent' ? 'bg-red-500' :
                      ticket.priority === 'high'   ? 'bg-orange-400' : 'bg-slate-300'
                    }`} />
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-2">
                        <span className="badge badge-slate   !px-3 !py-1">{ticket.type}</span>
                        <span className={`badge !px-3 !py-1 ${
                            ticket.status === 'resolved' ? 'badge-green' : 
                            ticket.status === 'in_progress' ? 'badge-amber' : 'badge-slate'
                        }`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                        <SlaBadge ticket={ticket} />
                      </div>
                    </div>
                  
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ">{ticket.title}</h3>
                    
                    <div className="flex items-center justify-between border-t border-black/5  pt-4 mt-4">
                      <div className="flex items-center gap-2">
                        {/* Assignee Avatar */}
                        {(() => {
                          const initial = ticket.assignee ? (ticket.assignee as any).name.charAt(0) : "U";
                          return (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(initial)}`}>
                              {initial}
                            </div>
                          );
                        })()}
                        <span className="text-sm font-bold text-[#6e6e73]  font-mono">#{ticket.id.slice(0, 8)}</span>
                      </div>
                      <span className="text-sm text-[#6e6e73]  font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-20 text-center bg-transparent border-dashed border-2 border-black/10  shadow-none">
              <div className="text-8xl mb-6 opacity-20">🎫</div>
              <h3 className="text-3xl font-extrabold mb-4 ">No tickets yet</h3>
              <p className="text-[#6e6e73]  text-lg font-medium mb-6">Your support requests will appear here once submitted.</p>
              {role === "employee" && (
                <Link href="/dashboard/create" className="text-blue-600 font-bold hover:underline">
                  Submit your first ticket →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="card p-6 bg-white  ">
            <h3 className="text-xl font-bold mb-4 ">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/dashboard/create" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50  transition-colors">
                <span className="text-xl">➕</span>
                <div>
                  <p className="text-sm font-bold ">New Ticket</p>
                  <p className="text-xs text-slate-500 ">Submit a new request</p>
                </div>
              </Link>
              <Link href="/dashboard/kb" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50  transition-colors">
                <span className="text-xl">📚</span>
                <div>
                  <p className="text-sm font-bold ">Browse KB</p>
                  <p className="text-xs text-slate-500 ">Find answers yourself</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6 bg-white  ">
            <h3 className="text-xl font-bold mb-4 ">Recent Activity</h3>
            <div className="text-sm text-slate-500 ">
              No recent activity to show.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
