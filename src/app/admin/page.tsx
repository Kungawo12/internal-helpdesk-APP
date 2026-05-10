"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  email: string;
  assigned: number;
  resolved: number;
  inProgress: number;
  open: number;
};

type RecentTicket = {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
  creator: { name: string };
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  itTickets: number;
  hrTickets: number;
  slaBreachedCount: number;
  slaAtRiskCount: number;
  usersByRole: { role: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  staffPerformance: StaffMember[];
  recentTickets: RecentTicket[];
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-red-400",
  manager: "text-purple-400",
  it_staff: "text-blue-400",
  hr_staff: "text-amber-400",
  employee: "text-slate-400",
};

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-300",
  in_progress: "bg-amber-500/20 text-amber-300",
  resolved: "bg-emerald-500/20 text-emerald-300",
  closed: "bg-slate-500/20 text-slate-400",
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-blue-400",
  low: "bg-slate-400",
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
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
        <div className="w-8 h-8 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-white/40">Failed to load stats.</p>;
  }

  const resolutionRate = stats.totalTickets > 0
    ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100)
    : 0;

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">System Overview</h1>
          <p className="text-white/30 mt-1 text-sm font-medium">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/admin/users"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"
        >
          Manage Users →
        </Link>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, sub: `${stats.activeUsers} active`, border: "border-white/10" },
          { label: "Total Tickets", value: stats.totalTickets, sub: `${stats.itTickets} IT · ${stats.hrTickets} HR`, border: "border-white/10" },
          { label: "Open / Active", value: stats.openTickets + stats.inProgressTickets, sub: `${stats.openTickets} open · ${stats.inProgressTickets} in progress`, border: "border-orange-500/30" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, sub: `${stats.resolvedTickets} resolved total`, border: "border-emerald-500/30" },
          { label: "SLA Breached", value: stats.slaBreachedCount, sub: "active tickets past deadline", border: "border-red-500/30", color: stats.slaBreachedCount > 0 ? "text-red-400" : "text-white" },
          { label: "SLA At Risk", value: stats.slaAtRiskCount, sub: "due within 1 hour", border: "border-amber-500/30", color: stats.slaAtRiskCount > 0 ? "text-amber-400" : "text-white" },
        ].map((k) => (
          <div key={k.label} className={`bg-white/5 border ${k.border} rounded-2xl p-6 hover:bg-white/8 transition-all`}>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{k.label}</p>
            <p className={`text-5xl font-extrabold mb-2 ${(k as any).color || "text-white"}`}>{k.value}</p>
            <p className="text-xs text-white/50 font-medium">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Ticket Status + Priority + Ticket Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Ticket Status</h2>
          <div className="space-y-4">
            {[
              { label: "Open", value: stats.openTickets, color: "bg-blue-500" },
              { label: "In Progress", value: stats.inProgressTickets, color: "bg-amber-400" },
              { label: "Resolved", value: stats.resolvedTickets, color: "bg-emerald-500" },
              { label: "Closed", value: stats.closedTickets, color: "bg-slate-500" },
            ].map((item) => {
              const pct = stats.totalTickets > 0 ? Math.round((item.value / stats.totalTickets) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-bold text-white/70">{item.label}</span>
                    <span className="text-sm font-extrabold text-white">{item.value} <span className="text-white/30 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">By Priority</h2>
          <div className="space-y-4">
            {["urgent", "high", "medium", "low"].map((priority) => {
              const found = stats.priorityBreakdown.find((p) => p.priority === priority);
              const value = found?.count ?? 0;
              const pct = stats.totalTickets > 0 ? Math.round((value / stats.totalTickets) * 100) : 0;
              return (
                <div key={priority}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-bold text-white/70 capitalize">{priority}</span>
                    <span className="text-sm font-extrabold text-white">{value} <span className="text-white/30 font-normal text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${PRIORITY_COLOR[priority]} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by Role */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Users by Role</h2>
          <div className="space-y-3">
            {stats.usersByRole
              .sort((a, b) => b.count - a.count)
              .map((r) => (
                <div key={r.role} className="flex items-center justify-between py-1">
                  <span className={`text-sm font-bold ${ROLE_COLORS[r.role] || "text-white/60"}`}>
                    {r.role.replace("_", " ").toUpperCase()}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/20 rounded-full"
                        style={{ width: `${Math.round((r.count / stats.totalUsers) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-extrabold text-white w-4 text-right">{r.count}</span>
                  </div>
                </div>
              ))}
          </div>
          <Link href="/admin/users" className="mt-5 block text-xs text-white/30 hover:text-white/60 font-bold transition-colors">
            Manage roles →
          </Link>
        </div>
      </div>

      {/* Staff Performance */}
      {stats.staffPerformance.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Staff Performance</h2>
            <p className="text-xs text-white/30 mt-1">IT &amp; HR staff — tickets assigned vs resolved</p>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-white/30 bg-white/3 border-b border-white/5">
                <th className="px-6 py-3 font-bold">Staff Member</th>
                <th className="px-6 py-3 font-bold text-center">Assigned</th>
                <th className="px-6 py-3 font-bold text-center hidden md:table-cell">In Progress</th>
                <th className="px-6 py-3 font-bold text-center">Resolved</th>
                <th className="px-6 py-3 font-bold">Resolution Rate</th>
              </tr>
            </thead>
            <tbody>
              {stats.staffPerformance
                .sort((a, b) => b.resolved - a.resolved)
                .map((staff) => {
                  const rate = staff.assigned > 0 ? Math.round((staff.resolved / staff.assigned) * 100) : 0;
                  return (
                    <tr key={staff.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{staff.name}</p>
                            <p className={`text-xs font-bold ${ROLE_COLORS[staff.role] || "text-white/40"}`}>
                              {staff.role.replace("_", " ").toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-extrabold text-white">{staff.assigned}</span>
                      </td>
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <span className="text-sm font-extrabold text-amber-400">{staff.inProgress}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-extrabold text-emerald-400">{staff.resolved}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${rate >= 70 ? "bg-emerald-500" : rate >= 40 ? "bg-amber-400" : "bg-red-500"}`}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-white/60 w-9 text-right">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {stats.staffPerformance.length === 0 && (
            <div className="text-center py-10 text-white/20 text-sm font-medium">No staff assigned yet.</div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Recent Activity</h2>
            <p className="text-xs text-white/30 mt-1">Last 10 tickets submitted</p>
          </div>
          <Link href="/admin/tickets" className="text-xs font-bold text-white/30 hover:text-white/60 transition-colors">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {stats.recentTickets.map((ticket) => (
            <div key={ticket.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/3 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLOR[ticket.priority] || "bg-slate-400"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{ticket.title}</p>
                  <p className="text-xs text-white/30">{ticket.creator.name} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="text-xs font-bold text-white/40">{ticket.type}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_BADGE[ticket.status] || "bg-white/10 text-white/40"}`}>
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
