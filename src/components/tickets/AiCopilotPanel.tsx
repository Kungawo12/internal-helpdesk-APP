"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface AiCopilotPanelProps {
  ticketId: string;
  onUseReply: (reply: string) => void;
}

export default function AiCopilotPanel({ ticketId, onUseReply }: AiCopilotPanelProps) {
  const { data: session } = useSession();
  const [copilotData, setCopilotData] = useState<{ summary: string; suggestedReply: string } | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = session?.user?.role;

  // Only visible when session.user.role === 'it_staff' || 'hr_staff' (or admin)
  if (role !== "it_staff" && role !== "hr_staff" && role !== "admin") return null;

  const runCopilot = async () => {
    setCopilotLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/copilot?ticketId=${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch copilot data");
      const data = await res.json();
      setCopilotData(data);
    } catch (err) {
      console.error("Copilot error:", err);
      setError("Failed to load AI suggestions.");
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">AI</div>
        <h4 className="font-black text-slate-900 text-sm">AI Copilot</h4>
      </div>

      {!copilotData && !copilotLoading && (
        <button onClick={runCopilot} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors">
          ✦ Analyse ticket
        </button>
      )}

      {copilotLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
          Analysing...
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
      )}

      {copilotData && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{copilotData.summary}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Suggested Reply</p>
            <div className="bg-white rounded-xl p-3 border border-blue-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {copilotData.suggestedReply}
            </div>
            <button
              onClick={() => onUseReply(copilotData.suggestedReply)}
              className="mt-2 text-xs text-blue-600 font-bold hover:underline"
            >
              Use this reply →
            </button>
          </div>
          <button onClick={() => setCopilotData(null)} className="text-xs text-slate-400 hover:text-slate-600">
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
