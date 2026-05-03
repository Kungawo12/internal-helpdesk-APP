"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to create account. Please try again.");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-dark grid-subtle relative overflow-hidden">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold text-white text-base">
              H
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Helpdesk</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Join our internal support platform</p>
        </div>

        <div className="card p-6 shadow-xl border-white/5 bg-white/[0.02]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field py-2 text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Work Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field py-2 text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field py-2 text-sm"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "employee", label: "Employee", desc: "Submit tickets" },
                  { value: "it_staff", label: "IT Staff", desc: "Resolve IT issues" },
                  { value: "hr_staff", label: "HR Staff", desc: "Resolve HR issues" },
                  { value: "manager", label: "Manager", desc: "Oversee all" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-2 rounded border text-left transition-all ${
                      form.role === r.value
                        ? "bg-primary/10 border-primary text-white"
                        : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="text-[11px] font-bold uppercase">{r.label}</div>
                    <div className="text-[10px] font-medium opacity-50">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-bold uppercase tracking-widest"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="pt-4 text-center border-t border-white/5">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary-light transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest opacity-50">
          &copy; 2026 Helpdesk System
        </p>
      </div>
    </div>
  );
}
