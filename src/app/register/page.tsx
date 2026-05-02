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
      gsap.from(".register-card", {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "power4.out",
      });
      gsap.from(".register-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.4,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Determine role based on department
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
      setError(data.error);
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Premium Background */}
      <div className="mesh-gradient" />
      <div className="noise" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="glow-blob w-[500px] h-[500px] bg-secondary/10 top-[-10%] left-[-10%]" />
      <div className="glow-blob w-[400px] h-[400px] bg-primary/20 bottom-[-10%] right-[-10%]" />

      <div className="register-card relative z-10 w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-10">
          <a href="/" className="register-item inline-flex items-center gap-3 mb-6 group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl font-black shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-110">
              H
            </div>
            <span className="text-2xl font-bold tracking-tighter">
              Helpdesk<span className="text-primary">.</span>
            </span>
          </a>
          <h1 className="register-item text-3xl font-black tracking-tight mb-2">Create Identity</h1>
          <p className="register-item text-slate-400 font-medium tracking-tight">Join the internal operations network</p>
        </div>

        {/* Form Container */}
        <div className="glass rounded-[40px] p-10 border-white/5 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
            {error && (
              <div className="register-item p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="register-item">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="register-item">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                Work Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="register-item">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                Security Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <div className="register-item">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2.5 ml-1">
                Assignment Department
              </label>
              <div className="relative">
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-5 py-4 glass border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                  required
                >
                  <option value="" disabled className="bg-gray-900">Select department</option>
                  <option value="Engineering" className="bg-gray-900">Engineering</option>
                  <option value="Marketing" className="bg-gray-900">Marketing</option>
                  <option value="IT Department" className="bg-gray-900">IT Department</option>
                  <option value="HR Department" className="bg-gray-900">HR Department</option>
                  <option value="Management" className="bg-gray-900">Management</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  ↓
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="register-item w-full py-4 bg-primary rounded-2xl font-black text-sm tracking-widest uppercase transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Create Identity"}
            </button>

            <div className="register-item pt-4 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Already registered?{" "}
                <a
                  href="/login"
                  className="text-primary hover:text-white transition-colors ml-1"
                >
                  Sign In
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
