"use client";

import { useState } from "react";

interface AiCopilotPanelProps {
  ticketId: string;
  onUseReply?: (text: string) => void;
}

export default function AiCopilotPanel({ ticketId, onUseReply }: AiCopilotPanelProps) {
  const [data, setData] = useState<{ summary: string; suggestedReply: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleUseReply = () => {
    if (!data) return;
    if (onUseReply) {
      onUseReply(data.suggestedReply);
    } else {
      navigator.clipboard.writeText(data.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-blue-100 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-100 bg-white/60">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-sm font-black">AI</div>
        <div>
          <p className="font-black text-sm text-slate-900 leading-none">AI Copilot</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Powered by GPT-4o mini</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-emerald-600 font-bold">Active</span>
        </div>
      </div>

      <div className="p-4">
        {!data && !loading && (
          <>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Instantly get an AI summary of this ticket and a suggested reply to send the employee.
            </p>
            <button
              onClick={handleFetch}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-black hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              ✦ Analyse this ticket
            </button>
          </>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-4 text-sm text-slate-500">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            Analysing ticket...
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center py-2">{error}</p>
        )}

        {data && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">AI Summary</p>
              <p className="text-sm text-slate-800 leading-relaxed">{data.summary}</p>
            </div>

            {/* Suggested Reply */}
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Suggested Reply</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.suggestedReply}</p>
              <button
                onClick={handleUseReply}
                className="mt-2.5 w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-black hover:bg-blue-700 transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy reply →"}
              </button>
            </div>

            <button
              onClick={() => setData(null)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors"
            >
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
