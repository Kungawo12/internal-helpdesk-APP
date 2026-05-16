"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SlaPolicy = {
  id: string;
  name: string;
  ticketType: "IT" | "HR";
  priority: "low" | "medium" | "high" | "urgent";
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: string;
};

function fmtMinutes(m: number) {
  if (m >= 1440) return `${m / 1440}d`;
  if (m >= 60) return `${m / 60}h`;
  return `${m}m`;
}

export default function SlaPoliciesPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [ticketType, setTicketType] = useState<"IT" | "HR">("IT");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [firstResponse, setFirstResponse] = useState("");
  const [resolution, setResolution] = useState("");

  const fetchPolicies = async () => {
    try {
      const res = await fetch("/api/admin-portal/sla-policies");
      if (res.ok) setPolicies(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    try {
      const res = await fetch(`/api/admin-portal/sla-policies/${id}`, { method: "DELETE" });
      if (res.ok) fetchPolicies();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin-portal/sla-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ticketType,
          priority,
          firstResponseMinutes: parseInt(firstResponse),
          resolutionMinutes: parseInt(resolution),
        }),
      });

      if (res.status === 409) {
        setError(`A policy for ${ticketType} / ${priority} already exists.`);
        return;
      }

      if (res.ok) {
        setShowForm(false);
        setName("");
        setFirstResponse("");
        setResolution("");
        fetchPolicies();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create policy.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">SLA Policies</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage service level agreements for different ticket types and priorities.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "Add Policy"}
        </button>
      </div>

      {showForm && (
        <div className="card p-8 border-2 border-blue-500/20 bg-blue-50/30 dark:bg-blue-900/10 animate-slide-up">
          <h2 className="text-xl font-bold mb-6">Create New Policy</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Policy Name</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. IT Urgent Response"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ticket Type</label>
                <div className="flex gap-2">
                  {["IT", "HR"].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTicketType(t as "IT" | "HR")}
                      className={`flex-1 py-2 rounded-xl border-2 font-bold transition-all ${
                        ticketType === t
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Priority Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["low", "medium", "high", "urgent"].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p as any)}
                      className={`py-2 rounded-xl border-2 font-bold uppercase text-[10px] tracking-widest transition-all ${
                        priority === p
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">First Response (mins)</label>
                <input
                  required
                  type="number"
                  value={firstResponse}
                  onChange={e => setFirstResponse(e.target.value)}
                  className="input-field"
                  placeholder="60 = 1 hour"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Resolution (mins)</label>
                <input
                  required
                  type="number"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  className="input-field"
                  placeholder="240 = 4 hours"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Policy
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Name</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Type</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Priority</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">First Resp</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Resolution</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {policies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                  No custom SLA policies. Default SLA timers are active.
                </td>
              </tr>
            ) : (
              policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{policy.name}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${policy.ticketType === "IT" ? "badge-blue" : "badge-amber"}`}>
                      {policy.ticketType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge uppercase text-[10px] tracking-tighter ${
                      policy.priority === "urgent" ? "bg-red-500 text-white" :
                      policy.priority === "high" ? "bg-orange-500 text-white" :
                      policy.priority === "medium" ? "bg-blue-500 text-white" :
                      "bg-slate-400 text-white"
                    }`}>
                      {policy.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{fmtMinutes(policy.firstResponseMinutes)}</td>
                  <td className="px-6 py-4 font-medium">{fmtMinutes(policy.resolutionMinutes)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(policy.id)}
                      className="text-red-500 hover:text-red-600 font-bold text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Note:</strong> Custom policies override built-in defaults. If no policy exists for a type+priority combo, the system falls back to hardcoded defaults (IT urgent: 1h/4h, IT high: 4h/8h, etc.).
        </p>
      </div>
    </div>
  );
}
