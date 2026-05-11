"use client";

import { useState } from "react";

interface AiCopilotPanelProps {
  ticketId: string;
}

export default function AiCopilotPanel({ ticketId }: AiCopilotPanelProps) {
  const [data, setData] = useState<{ summary: string; suggestedReply: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/copilot?ticketId=${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch copilot data");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Copilot error:", err);
      setError("Failed to load AI suggestions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-100">
      <button
        onClick={handleFetch}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl border-2 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          "🤖 Ask AI Copilot"
        )}
      </button>

      {error && (
        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
      )}

      {data && (
        <div className="mt-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">AI Summary</p>
            <p className="text-sm text-slate-900 leading-relaxed">{data.summary}</p>
          </div>
          <div className="border-t border-slate-50 pt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Suggested Reply</p>
            <p className="text-sm text-slate-900 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {data.suggestedReply}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
