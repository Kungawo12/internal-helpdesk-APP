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
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Create a New Ticket</h1>
        <p className="text-subtle mt-1">Please provide the details of your request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="card p-8 space-y-8 shadow-xl">
          {/* Ticket Type */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-300">Ticket Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "IT" })}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  form.type === "IT" 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-white/5 border-white/5 text-subtle hover:bg-white/10"
                }`}
              >
                <div className="text-2xl mb-2">🖥️</div>
                <div className="font-bold">IT Support</div>
                <div className="text-xs text-slate-500 mt-1">Hardware, Software, VPN</div>
              </button>
              
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "HR" })}
                className={`p-6 rounded-2xl border text-left transition-all ${
                  form.type === "HR" 
                    ? "bg-primary/10 border-primary text-white" 
                    : "bg-white/5 border-white/5 text-subtle hover:bg-white/10"
                }`}
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-bold">Human Resources</div>
                <div className="text-xs text-slate-500 mt-1">Payroll, Holidays, Benefits</div>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Briefly describe the issue"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field h-40"
                placeholder="Provide more details about your request..."
                required
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-300">Urgency</label>
            <div className="flex flex-wrap gap-3">
              {["low", "medium", "high", "urgent"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                    form.priority === p 
                      ? "bg-white text-black border-white" 
                      : "bg-white/5 border-white/5 text-subtle hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 py-4 text-base"
          >
            {loading ? "Creating Ticket..." : "Create Ticket"}
          </button>
          <Link
            href="/dashboard"
            className="btn-secondary py-4 px-8 text-base"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
