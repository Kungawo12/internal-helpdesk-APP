"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "IT",
    priority: "medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create ticket. Please try again.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Create New Ticket</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Please provide the details of your request.</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field py-2 text-sm"
                placeholder="What needs attention?"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field h-40 resize-none text-sm leading-relaxed"
                placeholder="Provide all relevant details..."
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2 text-sm font-bold"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
            <Link
              href="/dashboard"
              className="btn-secondary py-2 px-6 text-sm font-bold"
            >
              Cancel
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "IT", label: "IT Support", icon: "🖥️" },
                { id: "HR", label: "People & HR", icon: "👥" },
              ].map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: dept.id })}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.type === dept.id 
                      ? "bg-primary/10 border-primary/50 text-white" 
                      : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{dept.icon}</span>
                  <span className="text-xs font-bold">{dept.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</h3>
            <div className="grid grid-cols-2 gap-2">
              {["low", "medium", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all ${
                    form.priority === p 
                      ? "bg-primary border-primary text-white" 
                      : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
