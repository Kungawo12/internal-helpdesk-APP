"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      setError(data.error || "Failed to create ticket");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create New Ticket</h1>
        <p className="text-slate-400 mt-1">
          Describe your issue and we will get it resolved
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card-glow bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 space-y-6"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Ticket Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Ticket Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "IT" })}
              className={`p-4 rounded-xl border text-center transition-all ${
                form.type === "IT"
                  ? "bg-blue-600/20 border-blue-500/50 text-white"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-2xl block mb-1">🖥️</span>
              <span className="font-medium">IT Support</span>
              <span className="block text-xs text-slate-400 mt-1">
                Computer, software, network
              </span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "HR" })}
              className={`p-4 rounded-xl border text-center transition-all ${
                form.type === "HR"
                  ? "bg-purple-600/20 border-purple-500/50 text-white"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-2xl block mb-1">👥</span>
              <span className="font-medium">HR Support</span>
              <span className="block text-xs text-slate-400 mt-1">
                Wages, holidays, policies
              </span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Brief summary of your issue"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            rows={5}
            placeholder="Describe the issue in detail. Include any error messages, steps to reproduce, etc."
            required
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Priority
          </label>
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, priority: "low" })}
              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                form.priority === "low"
                  ? "bg-slate-600/20 border-slate-500/50 text-slate-300"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              Low
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, priority: "medium" })}
              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                form.priority === "medium"
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-400"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, priority: "high" })}
              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                form.priority === "high"
                  ? "bg-orange-600/20 border-orange-500/50 text-orange-400"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              High
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, priority: "urgent" })}
              className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                form.priority === "urgent"
                  ? "bg-red-600/20 border-red-500/50 text-red-400"
                  : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:bg-white/[0.06]"
              }`}
            >
              Urgent
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 rounded-xl font-semibold transition-all duration-300"
          >
            {loading ? "Creating..." : "Submit Ticket"}
          </button>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl font-medium transition-colors text-center"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
