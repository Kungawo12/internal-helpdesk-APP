"use client";

import { useEffect, useState } from "react";
import { getLatestComms } from "@/app/actions/comms";
import Link from "next/link";

export default function CommsPage() {
  const [comms, setComms] = useState<{ date: string; content: string } | null>(null);

  useEffect(() => {
    getLatestComms().then(setComms);
  }, []);

  return (
    <div className="min-h-screen bg-bg-dark pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Team Communication</h1>
            <p className="text-subtle mt-1">Latest synchronization from the Backend/Database team</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        <div className="card p-10 bg-white/[0.02] border-slate-100 dark:border-white/5 whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
          {comms ? (
            <div>
              <div className="mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold inline-block">
                {comms.date}
              </div>
              {comms.content}
            </div>
          ) : (
            <p className="text-subtle italic">Fetching latest transmission...</p>
          )}
        </div>
        
        <div className="mt-10 p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 text-xs text-subtle italic">
          Note: This view renders the raw data from COMMS.md. Always refer to the markdown file for full history.
        </div>
      </div>
    </div>
  );
}
