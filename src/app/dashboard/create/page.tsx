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
      setError(data.error || "Submission_Interrupted");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto pb-40">
      <div className="form-item mb-16">
        <div className="inline-block hud-frame px-4 py-1 border-primary/20 mb-4">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intake_Protocol</span>
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-white">Initialize_Ticket</h1>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em] mt-2">Constructing_New_Neural_Node</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
        {error && (
          <div className="form-item p-4 hud-frame border-accent/40 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest text-center animate-glitch">
            {error}
          </div>
        )}

        {/* SPEC REQUIREMENT: Ticket Type Buttons */}
        <div className="form-item space-y-6">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Sector_Alignment</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "IT" })}
              className={`hud-frame p-8 flex flex-col items-center justify-center gap-4 transition-all duration-500 group relative overflow-hidden ${
                form.type === "IT" ? "bg-primary text-black border-primary chromatic-glow" : "bg-hud-bg/10 border-white/5 text-slate-500 hover:bg-white/5"
              }`}
            >
              <span className="text-4xl group-hover:scale-125 transition-transform group-hover:rotate-12">🖥️</span>
              <span className="text-sm font-black uppercase tracking-[0.3em]">IT_Operations</span>
              {form.type === "IT" && <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 animate-glitch" />}
            </button>
            
            <button
              type="button"
              onClick={() => setForm({ ...form, type: "HR" })}
              className={`hud-frame p-8 flex flex-col items-center justify-center gap-4 transition-all duration-500 group relative overflow-hidden ${
                form.type === "HR" ? "bg-secondary text-white border-secondary chromatic-glow" : "bg-hud-bg/10 border-white/5 text-slate-500 hover:bg-white/5"
              }`}
            >
              <span className="text-4xl group-hover:scale-125 transition-transform group-hover:rotate-12">👥</span>
              <span className="text-sm font-black uppercase tracking-[0.3em]">People_Logistics</span>
              {form.type === "HR" && <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 animate-glitch" />}
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="form-item space-y-10">
          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Subject_Header</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-8 py-5 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-lg italic"
              placeholder="BRIEF_DESCRIPTIVE_HEADER"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Neural_Data_Stream (Description)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-8 py-6 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm h-64 resize-none leading-relaxed"
              placeholder="PROVIDE_DETAILED_CONTEXTUAL_DATA..."
              required
            />
          </div>
        </div>

        {/* SPEC REQUIREMENT: Priority Buttons */}
        <div className="form-item space-y-6">
          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Operational_Urgency</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["low", "medium", "high", "urgent"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm({ ...form, priority: p })}
                className={`py-4 hud-frame text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${
                  form.priority === p ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-slate-600 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="form-item flex flex-col md:flex-row gap-6 pt-10">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-6 bg-primary text-black font-black text-xs uppercase tracking-[0.5em] hover:brightness-110 active:scale-[0.98] transition-all relative overflow-hidden group/btn"
          >
             <span className="relative z-10">{loading ? "Transmitting..." : "Initialize_Core_Thread"}</span>
             <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 animate-glitch" />
          </button>
          <a
            href="/dashboard"
            className="px-16 py-6 hud-frame border-white/10 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all text-center flex items-center justify-center"
          >
            Abort_Operation
          </a>
        </div>
      </form>
    </div>
  );
}
