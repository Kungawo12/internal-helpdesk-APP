"use client";

import { useEffect, useState } from "react";

type AutomationRule = {
  id: string;
  name: string;
  active: boolean;
  condTicketType: string | null;
  condPriority: string | null;
  condStatus: string | null;
  condUnassigned: boolean;
  action: "assign_to_role" | "escalate_priority" | "notify_admins";
  actionValue: string | null;
  createdAt: string;
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-500/20 text-red-300 border border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  low: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    condTicketType: "" as string | null,
    condPriority: "" as string | null,
    condStatus: "" as string | null,
    condUnassigned: false,
    action: "assign_to_role" as "assign_to_role" | "escalate_priority" | "notify_admins",
    actionValue: "" as string | null,
  });

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/automation-rules");
      if (res.ok) {
        setRules(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation: at least one condition required
    if (!formData.condTicketType && !formData.condPriority && !formData.condStatus && !formData.condUnassigned) {
      setError("At least one condition is required");
      return;
    }

    try {
      const res = await fetch("/api/automation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.status === 201) {
        setIsFormOpen(false);
        setFormData({
          name: "",
          condTicketType: null,
          condPriority: null,
          condStatus: null,
          condUnassigned: false,
          action: "assign_to_role",
          actionValue: null,
        });
        fetchRules();
      } else {
        const d = await res.json();
        setError(d.error || "Failed to create rule");
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/automation-rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      const res = await fetch(`/api/automation-rules/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && rules.length === 0) {
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
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Automation Rules</h1>
          <p className="text-white/30 mt-1 text-sm font-medium">Automate ticket workflows</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-primary"
        >
          {isFormOpen ? "Close Form" : "＋ New Rule"}
        </button>
      </div>

      {/* New Rule Form */}
      {isFormOpen && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 page-reveal">
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-5">Create New Rule</h2>
          <form onSubmit={handleCreateRule} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Rule Name</label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                placeholder="e.g. Auto-assign IT Urgent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-3">Conditions (leave blank to match any)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/30 uppercase block mb-2">Ticket Type</label>
                  <div className="flex gap-2">
                    {["IT", "HR", ""].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, condTicketType: t || null })}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          formData.condTicketType === (t || null)
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {t || "Any"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/30 uppercase block mb-2">Priority</label>
                  <div className="grid grid-cols-5 gap-2">
                    {["low", "medium", "high", "urgent", ""].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, condPriority: p || null })}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all capitalize ${
                          formData.condPriority === (p || null)
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {p || "Any"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/30 uppercase block mb-2">Status</label>
                  <div className="flex gap-2">
                    {["open", "in_progress", ""].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, condStatus: s || null })}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all capitalize ${
                          formData.condStatus === (s || null)
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {s || "Any"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="unassigned"
                    checked={formData.condUnassigned}
                    onChange={(e) => setFormData({ ...formData, condUnassigned: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-red-500 focus:ring-red-500/50"
                  />
                  <label htmlFor="unassigned" className="text-sm font-bold text-white/70 cursor-pointer">
                    Unassigned only
                  </label>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-3">Action</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["assign_to_role", "escalate_priority", "notify_admins"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setFormData({ ...formData, action: a, actionValue: null })}
                    className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.action === a
                        ? "bg-red-500 text-white border-red-600"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {a.replace(/_/g, " ").toUpperCase()}
                  </button>
                ))}
              </div>

              {formData.action === "assign_to_role" && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-white/30 uppercase block mb-2">Role</label>
                  <div className="flex gap-2 max-w-xs">
                    {["it_staff", "hr_staff"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFormData({ ...formData, actionValue: r })}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          formData.actionValue === r
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {r === "it_staff" ? "IT Staff" : "HR Staff"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.action === "escalate_priority" && (
                <div className="mt-4">
                  <label className="text-xs font-bold text-white/30 uppercase block mb-2">New Priority</label>
                  <div className="flex gap-2 max-w-sm">
                    {["low", "medium", "high", "urgent"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, actionValue: p })}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all capitalize ${
                          formData.actionValue === p
                            ? "bg-red-500 text-white border-red-600"
                            : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                Create Rule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center text-white/40 italic">
            No automation rules. Create one to start auto-assigning or escalating tickets.
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{rule.name}</h3>
                    <button
                      onClick={() => handleToggleActive(rule.id, rule.active)}
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        rule.active
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      }`}
                    >
                      {rule.active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {rule.condTicketType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Type: {rule.condTicketType}
                      </span>
                    )}
                    {rule.condPriority && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[rule.condPriority]}`}>
                        Priority: {rule.condPriority}
                      </span>
                    )}
                    {rule.condStatus && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
                        Status: {rule.condStatus}
                      </span>
                    )}
                    {rule.condUnassigned && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div className="text-sm">
                    {rule.action === "assign_to_role" && (
                      <p className="text-emerald-400 font-medium">
                        → Auto-assign to {rule.actionValue === "it_staff" ? "IT Staff" : "HR Staff"}
                      </p>
                    )}
                    {rule.action === "escalate_priority" && (
                      <p className="text-orange-400 font-medium">
                        → Escalate priority to {rule.actionValue}
                      </p>
                    )}
                    {rule.action === "notify_admins" && (
                      <p className="text-blue-400 font-medium">
                        → Notify all admins
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Note */}
      <div className="bg-white/2 border border-white/5 rounded-2xl p-6">
        <p className="text-sm text-white/50 leading-relaxed">
          <span className="font-bold text-white/70">Note:</span> Rules run automatically when tickets are created or updated. All matching rules fire in order. Disable a rule with the toggle without deleting it.
        </p>
      </div>
    </div>
  );
}
