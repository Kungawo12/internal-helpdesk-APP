"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "employee", label: "Employee", icon: "👤" },
    { id: "it_staff", label: "IT Staff", icon: "🛠️" },
    { id: "hr_staff", label: "HR Staff", icon: "📋" },
    { id: "manager", label: "Manager", icon: "💼" },
  ];

  return (
    <div className="min-h-screen bg-[url('/assets/premium-bg-dark.png')] bg-cover bg-center bg-fixed flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl font-bold text-blue-600 text-xl mb-4 shadow-lg shadow-white/10">
              H
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-sm text-white/70">Join the enterprise helpdesk platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/90">Full Name</label>
              <input
                type="text"
                required
                className="input-field bg-white/10 text-white placeholder-white/40 border-white/20 focus:bg-white/20"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/90">Email Address</label>
              <input
                type="email"
                required
                className="input-field bg-white/10 text-white placeholder-white/40 border-white/20 focus:bg-white/20"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-white/90">Password</label>
              <input
                type="password"
                required
                className="input-field bg-white/10 text-white placeholder-white/40 border-white/20 focus:bg-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-white/90">Select Your Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                      role === r.id 
                        ? "bg-blue-600/50 border-blue-400 text-white shadow-lg" 
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-200 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg shadow-blue-900/30"
            >
              {loading ? "Creating Account..." : "Register Now"}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-sm text-white/70">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
