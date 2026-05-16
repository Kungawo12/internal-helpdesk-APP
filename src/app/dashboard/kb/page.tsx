"use client";

import { Suspense, useEffect, useState } from "react";

type PopularQuestion = {
  title: string;
  type: string;
  count: number;
  solution: string;
};

const TYPE_BADGE: Record<string, string> = {
  IT: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  HR: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  Software: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  general: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
};

const TYPE_ICON: Record<string, string> = {
  IT: "💻",
  HR: "👥",
  Software: "🐛",
  general: "📖",
};

function KbPortal() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const [popularQuestions, setPopularQuestions] = useState<PopularQuestion[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/kb/popular")
      .then((r) => r.ok ? r.json() : [])
      .then(setPopularQuestions)
      .catch(() => setPopularQuestions([]))
      .finally(() => setPopularLoading(false));
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    setAskError(null);
    try {
      const res = await fetch("/api/kb/ask-handbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) setAskError(data.error ?? "Something went wrong.");
      else setAnswer(data.answer);
    } catch {
      setAskError("Failed to connect. Please try again.");
    } finally {
      setAsking(false);
    }
  };

  const reset = () => { setAnswer(null); setAskError(null); setQuestion(""); };

  return (
    <div className="space-y-8 max-w-4xl pb-16 page-reveal">

      {/* Hero — GPT-4 Q&A embedded */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📚</span>
            <span className="text-xs font-black uppercase tracking-widest text-white/50">Help Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 text-white">Knowledge Base</h1>
          <p className="text-white/50 mb-8 text-sm font-medium">
            Powered by GPT-4 — answers come only from the official Karma Staff handbook
          </p>

          {/* Q&A form */}
          <form onSubmit={handleAsk} className="relative max-w-2xl">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question — e.g. How many leave days do I get per year?"
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 pr-32 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all text-sm"
              disabled={asking}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              {(answer || question) && (
                <button type="button" onClick={reset} className="px-3 py-2 text-white/50 text-sm transition-colors">
                  ✕
                </button>
              )}
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {asking ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Asking...</> : "Ask →"}
              </button>
            </div>
          </form>

          {/* Suggested questions */}
          {!answer && !askError && !asking && (
            <div className="flex flex-wrap gap-2 mt-4">
              {["How many leave days do I get?", "What is the dress code?", "When do I get paid?", "What happens if I'm late?"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="text-xs px-3 py-1.5 bg-white/10 border border-white/15 text-white/70 rounded-full font-medium transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Answer */}
          {answer && (
            <div className="mt-6 bg-white/10 border border-white/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">✦</span>
                <span className="text-xs font-bold text-violet-300 uppercase tracking-wide">Answer</span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{answer}</p>
              <button onClick={reset} className="mt-4 text-xs text-white/50 font-bold">
                Ask another question
              </button>
            </div>
          )}

          {/* Error */}
          {askError && (
            <div className="mt-6 bg-red-500/20 border border-red-400/30 rounded-2xl p-4">
              <p className="text-sm text-red-300">{askError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Handbook PDF Resource */}
      <div className="flex items-center gap-5 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 border border-slate-600">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">Karma Staff Employee Handbook</p>
          <p className="text-xs text-white/60 mt-0.5">Version 1.02 · Effective 1 July 2025 · Official policies, leave, pay &amp; conduct guidelines</p>
        </div>
        <a
          href="/handbook.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl transition-colors"
        >
          Open PDF →
        </a>
      </div>

      {/* Most Asked Questions — from real ticket data */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Most Asked Questions</h2>
          {!popularLoading && popularQuestions.length > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
              {popularQuestions.length}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">
          Real questions from employees — solved by the support team.
        </p>

        {popularLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : popularQuestions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3 opacity-20">💬</div>
            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">No solved questions yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Once tickets are resolved with solutions, they&apos;ll appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {popularQuestions.map((q, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenId(openId === i ? null : i)}
                  className="w-full flex items-start gap-3 p-5 text-left"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${TYPE_BADGE[q.type] ?? TYPE_BADGE.general}`}>
                    {TYPE_ICON[q.type] ?? "📖"} {q.type}
                  </span>
                  <span className="flex-1 text-sm font-bold text-slate-800 dark:text-white leading-snug">{q.title}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {q.count > 1 && (
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        ×{q.count}
                      </span>
                    )}
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${openId === i ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {openId === i && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-4 whitespace-pre-wrap">
                      {q.solution}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">Can&apos;t find what you&apos;re looking for?</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Our support team is ready to help. Raise a ticket and we&apos;ll get back to you.</p>
        </div>
        <a href="/dashboard/create" className="flex-shrink-0 px-6 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors">
          Raise a Ticket →
        </a>
      </div>
    </div>
  );
}

export default function KbPortalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-slate-800 rounded-full animate-spin" />
      </div>
    }>
      <KbPortal />
    </Suspense>
  );
}
