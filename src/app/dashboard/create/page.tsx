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
    <div className="max-w-4xl mx-auto pb-24 animate-fade-in">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-2">
            Create Ticket
          </h1>
          <p className="text-slate-400 text-lg font-medium">Please provide the details of your request.</p>
        </div>
        <Link href="/dashboard" className="btn-secondary flex items-center gap-2 group">
          <span className="transition-transform group-hover:-translate-x-1">←</span> 
          Return to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {error && (
          <div className="p-6 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-sm font-bold flex items-center gap-3">
            <span className="text-xl">⚠️</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Primary Details Card */}
            <div className="card p-10 md:p-14 space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
               
               <div className="relative z-10 space-y-10">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="input-field py-4 text-lg font-bold"
                      placeholder="What needs attention?"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="input-field h-64 resize-none leading-relaxed font-medium"
                      placeholder="Provide all relevant context, logs, or steps to reproduce..."
                      required
                    />
                  </div>
               </div>
            </div>

            {/* Actions Grid */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-5 text-lg w-full"
              >
                {loading ? "Submitting..." : "Submit Ticket"}
              </button>
              <Link
                href="/dashboard"
                className="btn-secondary py-5 px-10 text-lg w-full sm:w-auto text-center"
              >
                Cancel
              </Link>
            </div>
          </div>

          <div className="space-y-8">
             {/* Department Selection */}
             <div className="card p-8 space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "IT" })}
                    className={`w-full p-6 rounded-2xl border text-left transition-all relative group ${
                      form.type === "IT" 
                        ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/10" 
                        : "bg-white/5 border-white/5 text-subtle hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl transition-transform group-hover:scale-110">🖥️</div>
                      {form.type === "IT" && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <div className="font-bold text-lg">IT Operations</div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">Systems & Technical Support</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: "HR" })}
                    className={`w-full p-6 rounded-2xl border text-left transition-all relative group ${
                      form.type === "HR" 
                        ? "bg-primary/10 border-primary text-white shadow-lg shadow-primary/10" 
                        : "bg-white/5 border-white/5 text-subtle hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl transition-transform group-hover:scale-110">👥</div>
                      {form.type === "HR" && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <div className="font-bold text-lg">People Ops</div>
                    <div className="text-xs text-slate-500 mt-1 font-bold">Human Resources & Admin</div>
                  </button>
                </div>
             </div>

             {/* Urgency Selection */}
             <div className="card p-8 space-y-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p })}
                      className={`py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
                        form.priority === p 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white/5 border-white/5 text-slate-500 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                   <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                     Higher urgency requires justification and may undergo additional triage.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </form>
    </div>
  );
}
