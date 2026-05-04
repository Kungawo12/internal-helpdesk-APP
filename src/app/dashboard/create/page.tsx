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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create New Ticket</h1>
          <p className="text-sm text-slate-500">Submit a new service request to IT or HR</p>
        </div>
        <Link href="/dashboard" className="btn-secondary">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Ticket Title</label>
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
                <label className="text-sm font-semibold text-slate-700">Detailed Description</label>
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

        <div className="space-y-5">
          <div className="card p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Department</label>
              <div className="grid grid-cols-2 gap-2">
                {(["IT", "HR"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                      type === t 
                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t} Support
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Priority Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(["low", "medium", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all ${
                      priority === p 
                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>

          <div className="card p-4 bg-blue-50/50 border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Notice</h3>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              For urgent hardware issues, please visit the IT desk directly after submitting this ticket.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
