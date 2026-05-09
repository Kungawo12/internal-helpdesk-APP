"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalUsers: number;
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  itTickets: number;
  hrTickets: number;
  usersByRole: { role: string; count: number }[];
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-red-400",
  manager: "text-purple-400",
  it_staff: "text-blue-400",
  hr_staff: "text-amber-400",
  employee: "text-slate-400",
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

  const kpis = [
    { label: "Total Users", value: stats.totalUsers, color: "border-white/10" },
    { label: "Total Tickets", value: stats.totalTickets, color: "border-white/10" },
    { label: "Open Tickets", value: stats.openTickets, color: "border-orange-500/40" },
    { label: "Resolved", value: stats.resolvedTickets, color: "border-emerald-500/40" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">System Overview</h1>
        <p className="text-white/30 mt-1 text-sm font-medium">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div 
            key={k.label} 
            className={`bg-white/5 border ${k.color} rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-white/8 ${
              k.color.includes("orange") ? "hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]" :
              k.color.includes("emerald") ? "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]" :
              "hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            }`}
          >
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{k.label}</p>
            <p className="text-5xl font-extrabold text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket split */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/8 hover:shadow-[0_0_20px_rgba(239,68,68,0.05)]">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5">Ticket Split</h2>
          <div className="space-y-4">
            {[
              { label: "IT Tickets", value: stats.itTickets, color: "bg-blue-500" },
              { label: "HR Tickets", value: stats.hrTickets, color: "bg-amber-500" },
            ].map((item) => {
              const pct = stats.totalTickets > 0 ? Math.round((item.value / stats.totalTickets) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-white/70">{item.label}</span>
                    <span className="text-sm font-extrabold text-white">{item.value} <span className="text-white/30 font-medium">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users by role */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/8 hover:shadow-[0_0_20px_rgba(239,68,68,0.05)]">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-5">Users by Role</h2>
          <div className="space-y-3">
            {stats.usersByRole.map((r) => (
              <div key={r.role} className="flex items-center justify-between">
                <span className={`text-sm font-bold ${ROLE_COLORS[r.role] || "text-white/60"}`}>
                  {r.role.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-sm font-extrabold text-white">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
