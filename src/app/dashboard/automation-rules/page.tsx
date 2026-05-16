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

export default function AutomationRulesPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [condTicketType, setCondTicketType] = useState<string | null>(null);
  const [condPriority, setCondPriority] = useState<string | null>(null);
  const [condStatus, setCondStatus] = useState<string | null>(null);
  const [condUnassigned, setCondUnassigned] = useState(false);
  const [action, setAction] = useState<"assign_to_role" | "escalate_priority" | "notify_admins">("assign_to_role");
  const [actionValue, setActionValue] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/automation-rules");
      if (res.ok) setRules(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (rule: AutomationRule) => {
    try {
      const res = await fetch(`/api/automation-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !rule.active }),
      });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      const res = await fetch(`/api/automation-rules/${id}`, { method: "DELETE" });
      if (res.ok) fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!condTicketType && !condPriority && !condStatus && !condUnassigned) {
      setError("At least one condition is required.");
      return;
    }

    try {
      const res = await fetch("/api/automation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          condTicketType,
          condPriority,
          condStatus,
          condUnassigned,
          action,
          actionValue,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setName("");
        setCondTicketType(null);
        setCondPriority(null);
        setCondStatus(null);
        setCondUnassigned(false);
        setAction("assign_to_role");
        setActionValue(null);
        fetchRules();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create rule.");
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
          <h1 className="text-3xl font-extrabold tracking-tight">Automation Rules</h1>
          <p className="text-slate-500 dark:text-slate-400">Define automatic actions based on ticket conditions.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "New Rule"}
        </button>
      </div>

      {showForm && (
        <div className="card p-8 border-2 border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-900/10 animate-slide-up">
          <h2 className="text-xl font-bold mb-6">Create New Automation Rule</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rule Name</label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-field"
                placeholder="e.g. Auto-assign IT urgent tickets"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Conditions (leave blank to match any)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Ticket Type</label>
                  <div className="flex gap-1">
                    {["IT", "HR", "Any"].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCondTicketType(t === "Any" ? null : t)}
                        className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] transition-all ${
                          (t === "Any" && condTicketType === null) || condTicketType === t
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                  <select
                    className="input-field !py-1.5 text-xs"
                    value={condPriority || ""}
                    onChange={e => setCondPriority(e.target.value || null)}
                  >
                    <option value="">Any Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <div className="flex gap-1">
                    {["open", "in_progress", "Any"].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCondStatus(s === "Any" ? null : s)}
                        className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] transition-all ${
                          (s === "Any" && condStatus === null) || condStatus === s
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={condUnassigned}
                      onChange={e => setCondUnassigned(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Unassigned only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Action</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {[
                    { id: "assign_to_role", label: "Auto-assign to Role" },
                    { id: "escalate_priority", label: "Escalate Priority" },
                    { id: "notify_admins", label: "Notify Admins" }
                  ].map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => { setAction(a.id as any); setActionValue(null); }}
                      className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                        action === a.id
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                {action === "assign_to_role" && (
                  <div className="flex gap-2 animate-fade-in">
                    {["it_staff", "hr_staff"].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setActionValue(r)}
                        className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all ${
                          actionValue === r
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {r === "it_staff" ? "IT Staff" : "HR Staff"}
                      </button>
                    ))}
                  </div>
                )}

                {action === "escalate_priority" && (
                  <div className="flex gap-2 animate-fade-in">
                    {["low", "medium", "high", "urgent"].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setActionValue(p)}
                        className={`flex-1 py-2 rounded-lg border font-bold text-xs transition-all ${
                          actionValue === p
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
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
                className="btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              >
                Create Rule
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="card p-20 text-center border-dashed border-2">
            <div className="text-4xl mb-4 opacity-30">⚡</div>
            <p className="text-slate-500 italic">No automation rules. Create one to start auto-assigning or escalating tickets.</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="card p-6 flex items-start justify-between group">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{rule.name}</h3>
                  <button
                    onClick={() => handleToggleActive(rule)}
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full transition-all ${
                      rule.active
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {rule.active ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">Conditions:</span>
                  {rule.condTicketType && <span className="badge badge-blue">Type: {rule.condTicketType}</span>}
                  {rule.condPriority && (
                    <span className={`badge ${
                      rule.condPriority === "urgent" ? "bg-red-500 text-white" :
                      rule.condPriority === "high" ? "bg-orange-500 text-white" :
                      rule.condPriority === "medium" ? "bg-blue-500 text-white" :
                      "bg-slate-400 text-white"
                    }`}>Priority: {rule.condPriority}</span>
                  )}
                  {rule.condStatus && <span className="badge badge-slate">Status: {rule.condStatus}</span>}
                  {rule.condUnassigned && <span className="badge badge-amber">Unassigned</span>}
                  {!rule.condTicketType && !rule.condPriority && !rule.condStatus && !rule.condUnassigned && (
                    <span className="text-xs text-slate-400 italic">No conditions</span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">→</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {rule.action === "assign_to_role" && `Auto-assign to ${rule.actionValue === "it_staff" ? "IT Staff" : "HR Staff"}`}
                    {rule.action === "escalate_priority" && `Escalate priority to ${rule.actionValue?.toUpperCase()}`}
                    {rule.action === "notify_admins" && `Notify all admins`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(rule.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2"
                aria-label="Delete rule"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          <strong className="text-slate-900 dark:text-white">Tip:</strong> Rules run automatically when tickets are created or updated. All matching rules fire in order. Disable a rule with the toggle without deleting it.
        </p>
      </div>
    </div>
  );
}
