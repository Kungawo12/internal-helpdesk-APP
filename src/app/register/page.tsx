"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center gradient-bg grid-pattern px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">
              H
            </div>
            <span className="text-xl font-semibold">Internal Helpdesk</span>
          </a>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-slate-400 mt-1">Get started in under a minute</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="card-glow bg-white/[0.05] backdrop-blur-xl rounded-2xl p-8 border border-white/[0.08] space-y-5"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="you@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Department
            </label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
              required
            >
              <option value="" disabled className="bg-gray-900">
                Select your department
              </option>
              <option value="Engineering" className="bg-gray-900">Engineering</option>
              <option value="Marketing" className="bg-gray-900">Marketing</option>
              <option value="Sales" className="bg-gray-900">Sales</option>
              <option value="Finance" className="bg-gray-900">Finance</option>
              <option value="Operations" className="bg-gray-900">Operations</option>
              <option value="IT Department" className="bg-gray-900">IT Department</option>
              <option value="HR Department" className="bg-gray-900">HR Department</option>
              <option value="Management" className="bg-gray-900">Management</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
