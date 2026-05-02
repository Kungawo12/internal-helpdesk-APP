"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".form-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
      setError(data.error || "Submission Failed. Please verify connectivity.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto py-12 px-6">
      <div className="form-item mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-2">Initialize Request</h1>
        <p className="text-slate-500 font-medium">
          Detailed technical analysis begins immediately upon submission.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="form-item glass rounded-[40px] p-10 border-white/5 space-y-10 relative overflow-hidden group"
      >
        {/* Decorative background */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {/* Ticket Type Selection */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Service Category
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "IT" })}
              className={`group relative p-6 rounded-[24px] border transition-all text-left overflow-hidden ${
                form.type === "IT"
                  ? "bg-primary border-primary shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                  : "glass border-white/5 hover:bg-white/5"
              }`}
            >
              <div className="relative z-10">
                <span className="text-2xl block mb-2">🖥️</span>
                <span className={`font-bold text-lg block ${form.type === "IT" ? "text-white" : "text-slate-200"}`}>IT Operations</span>
                <span className={`text-xs block mt-1 ${form.type === "IT" ? "text-white/70" : "text-slate-500"}`}>
                  Infrastructure, Hardware, Access
                </span>
              </div>
              {form.type === "IT" && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "HR" })}
              className={`group relative p-6 rounded-[24px] border transition-all text-left overflow-hidden ${
                form.type === "HR"
                  ? "bg-secondary border-secondary shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                  : "glass border-white/5 hover:bg-white/5"
              }`}
            >
              <div className="relative z-10">
                <span className="text-2xl block mb-2">👥</span>
                <span className={`font-bold text-lg block ${form.type === "HR" ? "text-white" : "text-slate-200"}`}>People & HR</span>
                <span className={`text-xs block mt-1 ${form.type === "HR" ? "text-white/70" : "text-slate-500"}`}>
                  Payroll, Benefits, Policy
                </span>
              </div>
              {form.type === "HR" && (
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
              )}
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Subject Heading
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-6 py-4 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
            placeholder="e.g. Workstation connectivity disruption"
            required
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Technical Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-6 py-5 glass border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium min-h-[150px] resize-none"
            placeholder="Provide context, error codes, and symptoms..."
            required
          />
        </div>

        {/* Priority Matrix */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
            Operational Priority
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["low", "medium", "high", "urgent"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p })}
                className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  form.priority === p
                    ? "bg-white text-black border-white"
                    : "glass border-white/5 text-slate-500 hover:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Submission Actions */}
        <div className="flex flex-col md:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-primary rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? "Transmitting..." : "Initialize Ticket"}
          </button>
          <a
            href="/dashboard"
            className="px-10 py-4 glass border-white/5 rounded-2xl font-bold text-sm text-slate-400 hover:text-white transition-all text-center"
          >
            Cancel
          </a>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em]">
          Priority status dictates SLA response window
        </p>
      </div>
    </div>
  );
}
