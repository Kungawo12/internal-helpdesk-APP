"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function CreateTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") as "IT" | "HR" | null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"IT" | "HR">("IT");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeParam) {
      setType(typeParam);
    }
  }, [typeParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type, priority }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create ticket.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Selection Screen
  if (!typeParam) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">How can we help you?</h1>
          <p className="text-xl text-slate-500">Select the type of support you need to get started.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/dashboard/create?type=IT"
            className="card p-10 text-center hover:scale-[1.02] transition-transform cursor-pointer border-2 hover:border-blue-400 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🖥️</div>
            <h2 className="text-2xl font-bold mb-3">IT Support</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Computer, software, hardware, or network issues.
            </p>
          </Link>

          <Link
            href="/dashboard/create?type=HR"
            className="card p-10 text-center hover:scale-[1.02] transition-transform cursor-pointer border-2 hover:border-blue-400 group"
          >
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">👥</div>
            <h2 className="text-2xl font-bold mb-3">HR Support</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Wages, holidays, policies, or general HR queries.
            </p>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard" className="text-slate-500 font-bold hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-slate uppercase tracking-widest text-[10px] !px-3 font-black">
              {typeParam} Support
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Submit {typeParam} Support Ticket
          </h1>
        </div>
        <Link href="/dashboard/create" className="text-slate-500 font-bold hover:text-slate-900 transition-colors">
          Change Type
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ticket Title</label>
                <input
                  type="text"
                  required
                  className="input-field !text-lg !py-4"
                  placeholder={typeParam === 'IT' ? "e.g. Printer not responding" : "e.g. Question about holiday balance"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  required
                  rows={10}
                  className="input-field resize-none !py-4"
                  placeholder="Provide all relevant details to help us resolve this quickly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Priority Level</label>
              <div className="grid grid-cols-2 gap-3">
                {(["low", "medium", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-all ${
                      priority === p
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-bold text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-4 shadow-xl shadow-blue-600/20"
            >
              {loading ? "Submitting..." : "Send Request"}
            </button>

            <Link
              href="/dashboard"
              className="block text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </Link>
          </div>

          <div className="card p-6 bg-blue-50/50 border-blue-100">
            <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3">Notice</h3>
            <p className="text-sm text-blue-900/70 font-medium leading-relaxed">
              {typeParam === 'IT'
                ? "For urgent hardware issues, please visit the IT desk directly after submitting this ticket."
                : "HR queries are processed within 24-48 business hours."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CreateTicketPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <CreateTicketForm />
    </Suspense>
  );
}
