"use client";

import { useEffect, useState } from "react";

type Analytics = {
  weeklyVolume: { label: string; count: number }[];
  mttr: { all: number; it: number; hr: number };
  sla: {
    totalWithSla: number;
    totalBreached: number;
    breachRate: number;
    complianceRate: number;
  };
  byDepartment: {
    IT: { total: number; resolved: number; breached: number };
    HR: { total: number; resolved: number; breached: number };
  };
  openTicketAge: {
    under1h: number;
    under8h: number;
    under24h: number;
    under3d: number;
    over3d: number;
  };
  topResolvers: { name: string; role: string; resolved: number }[];
  csat: {
    totalRated: number;
    avgRating: number;
    responseRate: number;
    ratingDistribution: { star: number; count: number }[];
  };
};

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-red-500/20 text-red-300 border border-red-500/30",
  manager: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  it_staff: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  hr_staff: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  employee: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin-portal/analytics")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-slate-400 dark:text-white/40">
        Failed to load analytics data.
      </div>
    );
  }

  const maxWeeklyCount = Math.max(...data.weeklyVolume.map((w) => w.count), 1);
  const maxMttr = Math.max(data.mttr.all, data.mttr.it, data.mttr.hr, 1);
  const maxAgeCount = Math.max(
    data.openTicketAge.under1h,
    data.openTicketAge.under8h,
    data.openTicketAge.under24h,
    data.openTicketAge.under3d,
    data.openTicketAge.over3d,
    1
  );

  const complianceColor =
    data.sla.complianceRate >= 80
      ? "text-emerald-400"
      : data.sla.complianceRate >= 60
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="space-y-8 max-w-6xl pb-16 page-reveal bg-white dark:bg-slate-900 rounded-3xl p-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
        <p className="text-slate-400 dark:text-white/30 mt-1 text-sm font-medium">Platform performance and metrics</p>
      </div>

      {/* Section 1 - KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:bg-slate-800/8 transition-all">
          <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1">SLA Compliance</p>
          <p className={`text-3xl font-extrabold ${complianceColor}`}>{data.sla.complianceRate}%</p>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-1">target: 80%</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:bg-slate-800/8 transition-all">
          <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1">SLA Breached</p>
          <p className={`text-3xl font-extrabold ${data.sla.totalBreached > 0 ? "text-red-400" : "text-slate-900 dark:text-white"}`}>
            {data.sla.totalBreached}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-1">active tickets past deadline</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:bg-slate-800/8 transition-all">
          <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1">MTTR (Overall)</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.mttr.all}h</p>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-1">mean time to resolution</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:bg-slate-800/8 transition-all">
          <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-1">Resolved Tickets</p>
          <p className="text-3xl font-extrabold text-emerald-400">
            {data.byDepartment.IT.resolved + data.byDepartment.HR.resolved}
          </p>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-1">total resolved across depts</p>
        </div>
      </div>

      {/* Section 2 - Weekly Volume */}
      <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-6">Weekly Ticket Volume</h2>
        <div className="flex items-end gap-2 h-40">
          {data.weeklyVolume.map((w) => (
            <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-slate-400 dark:text-white/40">{w.count}</span>
              <div
                className="w-full bg-red-500/70 rounded-t-md transition-all"
                style={{ height: `${(w.count / maxWeeklyCount) * 100}%`, minHeight: w.count > 0 ? "4px" : "0" }}
              />
              <span className="text-[10px] text-slate-400 dark:text-white/30 text-center">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 - 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column A - MTTR by Department */}
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-4">MTTR by Department</h2>
          <div className="space-y-4">
            {[
              { label: "Overall", value: data.mttr.all },
              { label: "IT Dept", value: data.mttr.it },
              { label: "HR Dept", value: data.mttr.hr },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{r.label}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{r.value}h</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/5 rounded-full h-2">
                  <div
                    className="bg-red-500 rounded-full h-2 transition-all"
                    style={{ width: `${(r.value / maxMttr) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column B - Open Ticket Age */}
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-4">Open Ticket Age</h2>
          <div className="space-y-4">
            {[
              { label: "< 1h", count: data.openTicketAge.under1h, color: "bg-emerald-500" },
              { label: "< 8h", count: data.openTicketAge.under8h, color: "bg-blue-500" },
              { label: "< 24h", count: data.openTicketAge.under24h, color: "bg-amber-500" },
              { label: "< 3 days", count: data.openTicketAge.under3d, color: "bg-orange-500" },
              { label: "3+ days", count: data.openTicketAge.over3d, color: "bg-red-500" },
            ].map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">{r.label}</span>
                  <span className="text-slate-900 dark:text-white font-bold">{r.count}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800/5 rounded-full h-2">
                  <div
                    className={`${r.color} rounded-full h-2 transition-all`}
                    style={{ width: `${(r.count / maxAgeCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column C - SLA by Department */}
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-4">SLA by Department</h2>
          <div className="space-y-6">
            {([ "IT", "HR" ] as const).map((dept) => {
              const d = data.byDepartment[dept];
              const comp = d.total > 0 ? (((d.total - d.breached) / d.total) * 100).toFixed(0) : "100";
              return (
                <div key={dept} className="border-b border-slate-100 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">{dept} Department</span>
                    <span className={`text-xl font-extrabold ${parseInt(comp) >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                      {comp}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/3 p-2 rounded-lg">
                      <p className="text-slate-400 dark:text-white/40 mb-0.5">Total</p>
                      <p className="font-bold text-slate-900 dark:text-white">{d.total}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/3 p-2 rounded-lg">
                      <p className="text-slate-400 dark:text-white/40 mb-0.5">Resolved</p>
                      <p className="font-bold text-emerald-400">{d.resolved}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/3 p-2 rounded-lg">
                      <p className="text-slate-400 dark:text-white/40 mb-0.5">Breached</p>
                      <p className="font-bold text-red-400">{d.breached}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column D - CSAT */}
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 col-span-1 lg:col-span-3">
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mb-6">Customer Satisfaction</h2>
          
          {data.csat.totalRated === 0 ? (
            <p className="text-slate-400 dark:text-white/40 text-sm italic">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.csat.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1 font-bold uppercase tracking-widest">Avg Rating</p>
                  <div className="flex gap-0.5 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= Math.round(data.csat.avgRating) ? "text-amber-400" : "text-white/20"}`}>★</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.csat.totalRated}</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1 font-bold uppercase tracking-widest">Responses</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.csat.responseRate}%</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1 font-bold uppercase tracking-widest">Response Rate</p>
                </div>
              </div>

              {/* Rating distribution bars */}
              <div className="space-y-2">
                {[...data.csat.ratingDistribution].reverse().map(({ star, count }) => {
                  const pct = data.csat.totalRated > 0 ? (count / data.csat.totalRated) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white/60 w-4">{star}★</span>
                      <div className="flex-1 h-2 bg-white dark:bg-slate-800/10 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 dark:text-white/40 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 4 - Top Resolvers */}
      <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/3">
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Top Resolvers</h2>
        </div>
        {data.topResolvers.length === 0 ? (
          <div className="p-10 text-center text-slate-400 dark:text-white/40 italic">
            No resolved tickets yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/3">
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest w-16">Rank</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Name</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Role</th>
                  <th className="p-4 text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest text-right">Tickets Resolved</th>
                </tr>
              </thead>
              <tbody>
                {data.topResolvers.map((r, i) => (
                  <tr key={r.name} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/3 transition-colors">
                    <td className="p-4 font-bold text-slate-400 dark:text-white/40">{i + 1}.</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_COLOR[r.role] || "bg-slate-500/20 text-slate-300"}`}>
                        {r.role}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-400">{r.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
