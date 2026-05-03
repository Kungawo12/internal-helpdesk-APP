"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CreateTicketPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"IT" | "HR">("IT");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h1 className="heading-prime text-2xl">Create New Ticket</h1>
          <p className="text-sm text-slate-400">Submit a new service request to IT or HR</p>
        </div>
        <Link href="/dashboard" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6 bg-black/40">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ticket Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Briefly describe the issue..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detailed Description</label>
                <textarea
                  required
                  rows={8}
                  className="input-field resize-none"
                  placeholder="Provide all relevant details to help us resolve this quickly..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 bg-black/40 space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
              <div className="grid grid-cols-2 gap-2">
                {(["IT", "HR"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      type === t 
                        ? "bg-primary/20 border-primary text-primary" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {t} Support
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(["low", "medium", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      priority === p 
                        ? "bg-primary/20 border-primary text-primary" 
                        : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[11px] text-red-400 font-bold text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 shadow-xl shadow-primary/20"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>

          <div className="card p-5 bg-blue-500/5 border-blue-500/10">
            <h3 className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2">Notice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              For urgent hardware issues, please visit the IT desk directly after submitting this ticket.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
