"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".register-frame", {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "expo.out",
      });
      gsap.from(".register-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // SPEC REQUIREMENT: Role mapping logic
    let role = "employee";
    if (form.department === "IT Department") role = "it_staff";
    else if (form.department === "HR Department") role = "hr_staff";
    else if (form.department === "Management") role = "manager";

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registry Conflict Detected");
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      <div className="hud-bg" />
      <div className="scanlines" />
      <div className="cyber-grid absolute inset-0" />

      <div className="register-frame w-full max-w-lg relative z-10">
        <div className="text-center mb-12">
          <div className="register-item inline-flex items-center gap-4 mb-6 group cursor-pointer">
            <div className="w-14 h-14 bg-primary/10 border border-primary/50 flex items-center justify-center text-3xl font-black chromatic-glow group-hover:scale-110 transition-transform">
              H
            </div>
            <div className="text-left">
              <p className="text-[14px] font-black tracking-[0.5em] text-white">NEURAL_DESK</p>
              <p className="text-[10px] font-mono text-primary uppercase">REGISTRY_TERMINAL_V1</p>
            </div>
          </div>
          <h1 className="register-item text-4xl font-black italic uppercase tracking-tighter text-white">New_Identity_Initialization</h1>
        </div>

        <div className="hud-frame p-10 bg-hud-bg/20 backdrop-blur-3xl relative overflow-hidden group">
          <div className="scan-effect absolute inset-0 pointer-events-none opacity-20" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {error && (
              <div className="register-item p-4 hud-frame border-accent/40 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest text-center animate-glitch">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="register-item space-y-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Identity_Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-xs"
                  placeholder="NOMINAL_IDENTIFIER"
                  required
                />
              </div>

              <div className="register-item space-y-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Core_Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-5 py-4 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-xs"
                  placeholder="ID@CORE.NET"
                  required
                />
              </div>
            </div>

            <div className="register-item space-y-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Security_Sequence</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-4 bg-black/40 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:border-primary/50 transition-all font-mono text-xs"
                placeholder="••••••••••••"
                minLength={6}
                required
              />
            </div>

            <div className="register-item space-y-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Department_Assignment</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-5 py-4 bg-black/40 border border-white/10 text-white focus:outline-none focus:border-primary/50 transition-all font-mono text-xs appearance-none cursor-pointer"
                required
              >
                <option value="" disabled className="bg-bg-dark">SELECT_SECTOR</option>
                <option value="Engineering" className="bg-bg-dark">Engineering</option>
                <option value="Marketing" className="bg-bg-dark">Marketing</option>
                <option value="IT Department" className="bg-bg-dark">IT Department (STAFF)</option>
                <option value="HR Department" className="bg-bg-dark">HR Department (STAFF)</option>
                <option value="Management" className="bg-bg-dark">Management (MANAGER)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="register-item w-full py-5 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group/btn"
            >
              <span className="relative z-10">{loading ? "Synchronizing_Nexus..." : "Execute_Registration"}</span>
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50 animate-glitch" />
            </button>

            <div className="register-item pt-6 text-center border-t border-white/5">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                Already established?{" "}
                <a href="/login" className="text-primary hover:text-white transition-colors ml-2 italic underline underline-offset-4">
                  Access_Portal
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
