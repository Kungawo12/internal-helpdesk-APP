"use client";

import { useEffect, useState } from "react";

type SlaPolicy = {
  id: string;
  name: string;
  ticketType: "IT" | "HR";
  priority: "low" | "medium" | "high" | "urgent";
  firstResponseMinutes: number;
  resolutionMinutes: number;
  createdAt: string;
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-300 border border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

const TYPE_COLOR: Record<string, string> = {
  IT: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  HR: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
};

function fmtMinutes(m: number) {
  if (m >= 1440) return `${m / 1440}d`;
  if (m >= 60) return `${m / 60}h`;
  return `${m}m`;
}

export default function SlaPoliciesPage() {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    ticketType: "IT" as "IT" | "HR",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    firstResponseMinutes: 60,
    resolutionMinutes: 240,
  });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-portal/sla-policies");
      if (res.ok) {
        setPolicies(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleAddPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin-portal/sla-policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.status === 201) {
        setIsFormOpen(false);
        setFormData({
          name: "",
          ticketType: "IT",
          priority: "medium",
          firstResponseMinutes: 60,
          resolutionMinutes: 240,
        });
        fetchPolicies();
      } else if (res.status === 409) {
        setError(`A policy for ${formData.ticketType} / ${formData.priority} already exists`);
      } else {
        setError("Failed to create policy");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    try {
      const res = await fetch(`/api/admin-portal/sla-policies/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPolicies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16 page-reveal">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">SLA Policies</h1>
          <p className="text-white/30 mt-1 text-sm font-medium">Manage Service Level Agreements</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-primary"
        >
          {isFormOpen ? "Close Form" : "＋ Add Policy"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {policies.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-8xl mb-6 opacity-20">🕒</p>
            <h3 className="text-xl font-bold text-white mb-2">No custom SLA policies</h3>
            <p className="text-white/40">Default SLA timers are active.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/3">
                  <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Name</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Type</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Priority</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">First Response</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest">Resolution</th>
                  <th className="p-4 text-xs font-bold text-white/40 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="p-4 font-bold text-white">{policy.name}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[policy.ticketType]}`}>
                        {policy.ticketType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[policy.priority]}`}>
                        {policy.priority}
                      </span>
                    </td>
                    <td className="p-4 text-white/70">{fmtMinutes(policy.firstResponseMinutes)}</td>
                    <td className="p-4 text-white/70">{fmtMinutes(policy.resolutionMinutes)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Policy Form */}
      {isFormOpen && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6 page-reveal">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Add New Policy</h2>
          <form onSubmit={handleAddPolicy} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. IT Urgent Support"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Ticket Type</label>
                <div className="flex gap-3">
                  {(["IT", "HR"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, ticketType: t })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                        formData.ticketType === t
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Priority</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                        formData.priority === p
                          ? "bg-red-500 text-white border-red-600"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">First Response</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Minutes"
                    value={formData.firstResponseMinutes}
                    onChange={(e) => setFormData({ ...formData, firstResponseMinutes: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-white/30 mt-1">60 = 1 hour</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Resolution</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Minutes"
                    value={formData.resolutionMinutes}
                    onChange={(e) => setFormData({ ...formData, resolutionMinutes: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-white/30 mt-1">240 = 4 hours</p>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-400 font-bold">{error}</p>}

            <div className="flex gap-3 pt-4 justify-end">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6"
              >
                Save Policy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Note */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
        <p className="text-sm text-white/50 leading-relaxed">
          <span className="font-bold text-white/70">Note:</span> Custom policies override built-in defaults. If no policy exists for a type+priority combo, the system falls back to hardcoded defaults (IT urgent: 1h/4h, IT high: 4h/8h, etc.).
        </p>
      </div>
    </div>
  );
}
