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
  return colors[initial.charCodeAt(0) % colors.length];
};

// ─── Types for admin stats ────────────────────────────────────────────────────
type StaffMember = {
  id: string; name: string; role: string; email: string;
  assigned: number; resolved: number; inProgress: number; open: number;
};
type RecentTicket = {
  id: string; title: string; type: string; status: string;
  priority: string; createdAt: string; creator: { name: string };
};
type AdminStats = {
  totalUsers: number; activeUsers: number; totalTickets: number;
  openTickets: number; inProgressTickets: number; resolvedTickets: number;
  closedTickets: number; itTickets: number; hrTickets: number;
  slaBreachedCount: number; slaAtRiskCount: number;
  usersByRole: { role: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  staffPerformance: StaffMember[];
  recentTickets: RecentTicket[];
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-red-500", manager: "text-purple-500",
  it_staff: "text-blue-500", hr_staff: "text-amber-500", employee: "text-slate-400 dark:text-slate-500",
};
const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-100 text-blue-700", in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700", closed: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500",
};
const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-500", high: "bg-orange-400", medium: "bg-blue-400", low: "bg-slate-300",
};

const ADMIN_NAV = [
  { label: "Manage Users", href: "/admin/users", icon: "👥" },
  { label: "All Tickets", href: "/admin/tickets", icon: "🎫" },
  { label: "SLA Policies", href: "/admin/sla-policies", icon: "⏱" },
  { label: "Analytics", href: "/admin/analytics", icon: "📊" },
  { label: "Knowledge Base", href: "/admin/kb", icon: "📚" },
  { label: "Automation Rules", href: "/admin/automation-rules", icon: "⚡" },
  { label: "Templates", href: "/admin/templates", icon: "📄" },
];

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ name }: { name: string }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-portal/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-slate-400 dark:text-slate-500 text-center py-20">Failed to load admin stats.</p>;
  }

  const resolutionRate = stats.totalTickets > 0
    ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100) : 0;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="badge badge-slate !px-4 !py-2 !text-sm">Admin Portal</span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 dark:text-slate-500">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome back,<br />{name.split(" ")[0]}
          </h1>
        </div>
      </div>

      {/* Admin Quick Nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card p-4 flex flex-col items-center gap-2 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors text-center group"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors leading-tight">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, sub: `${stats.activeUsers} active`, accent: "" },
          { label: "Total Tickets", value: stats.totalTickets, sub: `${stats.itTickets} IT · ${stats.hrTickets} HR`, accent: "" },
          { label: "Open / Active", value: stats.openTickets + stats.inProgressTickets, sub: `${stats.openTickets} open · ${stats.inProgressTickets} in progress`, accent: "" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, sub: `${stats.resolvedTickets} resolved`, accent: "text-emerald-600" },
          { label: "SLA Breached", value: stats.slaBreachedCount, sub: "past deadline", accent: stats.slaBreachedCount > 0 ? "text-red-600" : "" },
          { label: "SLA At Risk", value: stats.slaAtRiskCount, sub: "due within 1 hour", accent: stats.slaAtRiskCount > 0 ? "text-amber-600" : "" },
        ].map((k) => (
          <div key={k.label} className="card p-6">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{k.label}</p>
            <p className={`text-4xl font-extrabold mb-1 ${k.accent || "text-slate-900 dark:text-white"}`}>{k.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Breakdowns row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status */}
        <div className="card p-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Ticket Status</h2>
          <div className="space-y-4">
            {[
              { label: "Open", value: stats.openTickets, color: "bg-blue-500" },
              { label: "In Progress", value: stats.inProgressTickets, color: "bg-amber-400" },
              { label: "Resolved", value: stats.resolvedTickets, color: "bg-emerald-500" },
              { label: "Closed", value: stats.closedTickets, color: "bg-slate-300" },
            ].map((item) => {
              const pct = stats.totalTickets > 0 ? Math.round((item.value / stats.totalTickets) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500">{item.label}</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{item.value} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div className="card p-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">By Priority</h2>
          <div className="space-y-4">
            {["urgent", "high", "medium", "low"].map((priority) => {
              const found = stats.priorityBreakdown.find((p) => p.priority === priority);
              const value = found?.count ?? 0;
              const pct = stats.totalTickets > 0 ? Math.round((value / stats.totalTickets) * 100) : 0;
              return (
                <div key={priority}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 capitalize">{priority}</span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">{value} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${PRIORITY_COLOR[priority]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by Role */}
        <div className="card p-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Users by Role</h2>
          <div className="space-y-3">
            {stats.usersByRole.sort((a, b) => b.count - a.count).map((r) => (
              <div key={r.role} className="flex items-center justify-between py-1">
                <span className={`text-sm font-bold ${ROLE_COLORS[r.role] || "text-slate-500 dark:text-slate-400 dark:text-slate-500"}`}>
                  {r.role.replace("_", " ").toUpperCase()}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${Math.round((r.count / stats.totalUsers) * 100)}%` }} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white w-4 text-right">{r.count}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href="/admin/users" className="mt-5 block text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 font-bold transition-colors">
            Manage roles →
          </Link>
        </div>
      </div>

      {/* Staff Performance */}
      {stats.staffPerformance.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Staff Performance</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">IT &amp; HR staff — tickets assigned vs resolved</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-3 font-bold">Staff Member</th>
                <th className="px-6 py-3 font-bold text-center">Assigned</th>
                <th className="px-6 py-3 font-bold text-center hidden md:table-cell">In Progress</th>
                <th className="px-6 py-3 font-bold text-center">Resolved</th>
                <th className="px-6 py-3 font-bold">Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.staffPerformance.sort((a, b) => b.resolved - a.resolved).map((staff) => {
                const rate = staff.assigned > 0 ? Math.round((staff.resolved / staff.assigned) * 100) : 0;
                return (
                  <tr key={staff.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${getAvatarColor(staff.name.charAt(0))}`}>
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{staff.name}</p>
                          <p className={`text-xs font-bold ${ROLE_COLORS[staff.role] || "text-slate-400 dark:text-slate-500"}`}>
                            {staff.role.replace("_", " ").toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center"><span className="text-sm font-extrabold text-slate-900 dark:text-white">{staff.assigned}</span></td>
                    <td className="px-6 py-4 text-center hidden md:table-cell"><span className="text-sm font-extrabold text-amber-500">{staff.inProgress}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-sm font-extrabold text-emerald-600">{staff.resolved}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${rate >= 70 ? "bg-emerald-500" : rate >= 40 ? "bg-amber-400" : "bg-red-500"}`} style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 dark:text-slate-500 w-9 text-right">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Recent Activity</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Last 10 tickets submitted</p>
          </div>
          <Link href="/admin/tickets" className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-blue-600 transition-colors">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentTickets.map((ticket) => (
            <div key={ticket.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLOR[ticket.priority] || "bg-slate-300"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{ticket.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{ticket.creator.name} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{ticket.type}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_BADGE[ticket.status] || "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-500"}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Employee / Staff Dashboard ───────────────────────────────────────────────
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
    if (!dismissed && role === "employee") setShowBanner(true);
  }, [role]);

  // Admin gets their own full view
  if (role === "admin") {
    return <AdminDashboard name={session?.user?.name || "Admin"} />;
  }

  const stats = useMemo(() => ({
    total: allTickets.length,
    open: allTickets.filter(t => t.status === "open").length,
    inProgress: allTickets.filter(t => t.status === "in_progress").length,
    resolved: allTickets.filter(t => t.status === "resolved").length,
  }), [allTickets]);

  const tickets = useMemo(() => {
    return allTickets.filter(t => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [allTickets, statusFilter, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
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
    { label: "Tickets Raised", value: stats.total, style: "bg-black text-white", icon: "🎫", iconBg: "bg-white/10" },
    { label: "Pending", value: stats.open, style: "bg-white text-black", icon: "🔴", iconBg: "bg-red-50" },
    { label: "Needs Action", value: stats.inProgress, style: "bg-blue-600 text-white", icon: "⚡", iconBg: "bg-white/10" },
    { label: "Resolved", value: stats.resolved, style: "bg-white text-black", icon: "✅", iconBg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto pb-32">
      {showBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-10"
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=80')" }} />
          <div className="relative z-10">
            <button onClick={() => { localStorage.setItem("dismissedOnboardingBanner", "true"); setShowBanner(false); }}
              className="absolute top-0 right-0 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:text-slate-500">✕</button>
            <h3 className="font-bold text-blue-800 mb-2">👋 Welcome to Helpdesk!</h3>
            <p className="text-sm text-blue-700 mb-1">Need IT help? → Click <strong>IT Ticket</strong> above</p>
            <p className="text-sm text-blue-700 mb-1">Have a question? → Go to <strong>Knowledge Base</strong></p>
            <p className="text-sm text-blue-700">Track your requests → Scroll down</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="badge badge-slate !px-4 !py-2 !text-sm">Employee Portal</span>
            <span className="text-sm font-semibold text-[#6e6e73]">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Welcome back,<br />{session?.user?.name?.split(" ")[0] || "User"}</h1>
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
        </div>
      </div>

      {/* KPIs */}
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
        <div className="h-px bg-slate-200 flex-1" />
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Today&apos;s Activity</span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Ticket Grid */}
      <div className="animate-fade-in delay-300 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-3xl font-extrabold tracking-tight">Active Stream</h2>
          <div className="flex w-full md:w-auto gap-4">
            <input type="text" placeholder="Search..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-field max-w-xs" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-[160px]">
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">Working</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              const borderClass = ticket.status === "open" ? "ticket-card-open"
                : ticket.status === "in_progress" ? "ticket-card-progress"
                : ticket.status === "resolved" ? "ticket-card-resolved" : "";
              return (
                <div key={ticket.id} onClick={() => router.push(`/dashboard/ticket/${ticket.id}`)}
                  className={`card p-6 cursor-pointer group hover:bg-[#fafafa] dark:hover:bg-slate-800/50 relative ${borderClass}`}>
                  <div className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full ${
                    ticket.priority === "urgent" ? "bg-red-500" : ticket.priority === "high" ? "bg-orange-400" : "bg-slate-300"
                  }`} />
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2">
                      <span className="badge badge-slate !px-3 !py-1">{ticket.type}</span>
                      <span className={`badge !px-3 !py-1 ${
                        ticket.status === "resolved" ? "badge-green" : ticket.status === "in_progress" ? "badge-amber" : "badge-slate"
                      }`}>{ticket.status.replace("_", " ")}</span>
                      <SlaBadge ticket={ticket} />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{ticket.title}</h3>
                  <div className="flex items-center justify-between border-t border-black/5 pt-4 mt-4">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const initial = ticket.assignee ? (ticket.assignee as any).name.charAt(0) : "U";
                        return (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(initial)}`}>
                            {initial}
                          </div>
                        );
                      })()}
                      <span className="text-sm font-bold text-[#6e6e73] font-mono">#{ticket.id.slice(0, 8)}</span>
                    </div>
                    <span className="text-sm text-[#6e6e73] font-bold">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-20 text-center bg-transparent border-dashed border-2 border-black/10 shadow-none">
            <div className="text-8xl mb-6 opacity-20">🎫</div>
            <h3 className="text-3xl font-extrabold mb-4">No tickets yet</h3>
            <p className="text-[#6e6e73] text-lg font-medium mb-6">Your support requests will appear here once submitted.</p>
            {role === "employee" && (
              <Link href="/dashboard/create" className="text-blue-600 font-bold hover:underline">
                Submit your first ticket →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
