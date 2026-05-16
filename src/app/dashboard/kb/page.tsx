"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

type KbArticle = {
  id: string;
  title: string;
  content: string;
  type: "IT" | "HR" | "general";
  tags: string;
  views: number;
  createdAt: string;
  author: { name: string };
};

const TYPE_BADGE: Record<string, string> = {
  IT: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  HR: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
  general: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
};

const TYPE_LEFT: Record<string, string> = {
  IT: "border-l-4 border-l-blue-500",
  HR: "border-l-4 border-l-amber-500",
  general: "border-l-4 border-l-emerald-500",
};

const TYPE_ICON: Record<string, string> = {
  IT: "💻",
  HR: "👥",
  general: "📖",
};

const CARDS_PER_PAGE = 9;


function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part) =>
    part.toLowerCase() === query.toLowerCase()
      ? `<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">${part}</mark>`
      : part
  ).join("");
}

function clientSearch(articles: KbArticle[], query: string): KbArticle[] {
  if (!query.trim()) return articles;
  const q = query.toLowerCase();
  return articles
    .map((a) => {
      const titleMatch = a.title.toLowerCase().includes(q);
      const contentMatch = a.content.toLowerCase().includes(q);
      const tagMatch = a.tags.toLowerCase().includes(q);
      const score = (titleMatch ? 3 : 0) + (contentMatch ? 1 : 0) + (tagMatch ? 2 : 0);
      return { ...a, score };
    })
    .filter((a) => (a as any).score > 0)
    .sort((a, b) => (b as any).score - (a as any).score);
}

function KbPortal() {
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");
  const [page, setPage] = useState(0);
  const [handbookQuestion, setHandbookQuestion] = useState("");
  const [handbookAnswer, setHandbookAnswer] = useState<string | null>(null);
  const [handbookLoading, setHandbookLoading] = useState(false);
  const [handbookError, setHandbookError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KbArticle | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== "All") params.append("type", filterType);
      const url = `/api/kb${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (res.ok) setArticles(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/kb/${id}`);
      if (res.ok) setSelectedArticle(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchArticles(); }, [filterType]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(0); }, [filterType, searchQuery]);

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (articleId) fetchArticleDetail(articleId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setFilterType("All");
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    searchRef.current?.focus();
  };

  const handleHandbookAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handbookQuestion.trim()) return;
    setHandbookLoading(true);
    setHandbookAnswer(null);
    setHandbookError(null);
    try {
      const res = await fetch("/api/kb/ask-handbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: handbookQuestion }),
      });
      const data = await res.json();
      if (!res.ok) {
        setHandbookError(data.error ?? "Something went wrong.");
      } else {
        setHandbookAnswer(data.answer);
      }
    } catch {
      setHandbookError("Failed to connect. Please try again.");
    } finally {
      setHandbookLoading(false);
    }
  };

  const filtered = searchQuery ? clientSearch(articles, searchQuery) : articles;
  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const visible = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  // ── Article Detail View ──────────────────────────────────────────────────
  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 page-reveal">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-sm font-semibold text-slate-500 dark:text-slate-400   transition-colors flex items-center gap-1.5"
        >
          ← Back to Knowledge Base
        </button>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${TYPE_BADGE[selectedArticle.type]}`}>
              {TYPE_ICON[selectedArticle.type]} {selectedArticle.type === "general" ? "General" : selectedArticle.type}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">👁 {selectedArticle.views} views</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            {selectedArticle.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
            <span className="font-semibold">{selectedArticle.author.name}</span>
            <span>·</span>
            <span>{new Date(selectedArticle.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
            {selectedArticle.content}
          </div>

          {selectedArticle.tags && (
            <div className="flex flex-wrap gap-1.5 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
              {selectedArticle.tags.split(",").map((tag) => (
                <span key={tag} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">Still need help?</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            If this article didn&apos;t solve your problem,{" "}
            <a href="/dashboard/create" className="underline font-semibold">raise a support ticket</a>{" "}
            and our team will assist you directly.
          </p>
        </div>
      </div>
    );
  }

  // ── Main KB View ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-6xl pb-16 page-reveal">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📚</span>
            <span className="text-xs font-black uppercase tracking-widest text-white/50">Help Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-white">Knowledge Base</h1>
          <p className="text-white/60 mb-8 text-base">
            {articles.length > 0 ? `${articles.length} articles` : "Loading articles..."} — search for answers below
          </p>
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search — e.g. reset password, annual leave, VPN..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 pr-32 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15 focus:border-white/40 transition-all text-base"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              {searchInput && (
                <button type="button" onClick={clearSearch} className="px-3 py-2 text-white/60  text-sm transition-colors">
                  ✕
                </button>
              )}
              <button type="submit" className="px-4 py-2 bg-blue-600  text-white text-sm font-bold rounded-xl transition-colors">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Handbook Resource */}
      {!searchQuery && (
        <div className="flex items-center gap-5 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 border border-slate-600">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📋</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">Karma Staff Employee Handbook</p>
            <p className="text-xs text-white/60 mt-0.5">Version 1.02 · Effective 1 July 2025 · Official policies, leave, pay & conduct guidelines</p>
          </div>
          <a
            href="/handbook.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl  transition-colors"
          >
            Open PDF →
          </a>
        </div>
      )}

      {/* Ask the Handbook — GPT-4 powered */}
      {!searchQuery && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0">✦</div>
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">Ask the Handbook</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Powered by GPT-4 — answers come only from the official Karma Staff handbook</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <form onSubmit={handleHandbookAsk} className="flex gap-3">
              <input
                type="text"
                value={handbookQuestion}
                onChange={(e) => setHandbookQuestion(e.target.value)}
                placeholder="e.g. How many leave days do I get per year?"
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-colors"
                disabled={handbookLoading}
              />
              <button
                type="submit"
                disabled={handbookLoading || !handbookQuestion.trim()}
                className="px-5 py-3 bg-violet-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
              >
                {handbookLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Asking...
                  </>
                ) : "Ask →"}
              </button>
            </form>

            {handbookAnswer && (
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Answer</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{handbookAnswer}</p>
                <button
                  onClick={() => { setHandbookAnswer(null); setHandbookQuestion(""); }}
                  className="mt-3 text-xs text-violet-500 dark:text-violet-400 font-bold"
                >
                  Ask another question
                </button>
              </div>
            )}

            {handbookError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-xl p-4">
                <p className="text-sm text-red-700 dark:text-red-400">{handbookError}</p>
              </div>
            )}

            {!handbookAnswer && !handbookError && !handbookLoading && (
              <div className="flex flex-wrap gap-2">
                {["How many leave days do I get?", "What is the dress code?", "When do I get paid?", "What happens if I'm late?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setHandbookQuestion(q)}
                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-medium transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search result count */}
      {searchQuery && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for <span className="font-bold text-slate-900 dark:text-white">&ldquo;{searchQuery}&rdquo;</span>
          </p>
          <button onClick={clearSearch} className="text-xs text-blue-600 dark:text-blue-400 font-bold ">
            Clear search
          </button>
        </div>
      )}

      {/* Category filter */}
      {!searchQuery && (
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "IT", "HR", "general"] as const).map((t) => {
            const count = t === "All" ? articles.length : articles.filter((a) => a.type === t).length;
            return (
              <button
                key={t}
                onClick={() => { setFilterType(t); setPage(0); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${
                  filterType === t
                    ? "bg-slate-800 dark:bg-slate-700 text-white border-slate-800 dark:border-slate-600"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700   "
                }`}
              >
                {t === "IT" ? "💻" : t === "HR" ? "👥" : t === "general" ? "📖" : "🗂️"}
                {t === "general" ? "General" : t}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterType === t ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-medium">{articles.length} article{articles.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Article Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded mb-1.5" />
              <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-20 text-center">
          <div className="text-6xl mb-4 opacity-20">📚</div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No articles found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Try different keywords or browse all categories.</p>
          {searchQuery && <button onClick={clearSearch} className="text-sm text-blue-600 dark:text-blue-400 font-bold ">Clear search</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((article) => (
            <div
              key={article.id}
              className={`group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden    transition-all flex flex-col ${TYPE_LEFT[article.type]}`}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[article.type]}`}>
                    {TYPE_ICON[article.type]} {article.type === "general" ? "General" : article.type}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">👁 {article.views}</span>
                </div>

                <h3
                  onClick={() => fetchArticleDetail(article.id)}
                  className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug  dark: transition-colors cursor-pointer"
                  dangerouslySetInnerHTML={{ __html: highlight(article.title, searchQuery) }}
                />

                <div className={`overflow-hidden transition-all duration-300 ${expandedId === article.id ? "max-h-96" : "max-h-0"}`}>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2 pb-3">
                    {article.content?.slice(0, 400)}{(article.content?.length ?? 0) > 400 ? "..." : ""}
                  </p>
                  <button onClick={() => fetchArticleDetail(article.id)} className="text-xs font-bold text-blue-600 dark:text-blue-400  transition-colors">
                    Read full article →
                  </button>
                </div>

                {expandedId !== article.id && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {article.content?.slice(0, 90) ?? ""}...
                  </p>
                )}
              </div>

              <div className="px-5 pb-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
                <div className="flex flex-wrap gap-1">
                  {article.tags?.split(",").slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                  className="text-[11px] font-bold text-slate-500 dark:text-slate-400   transition-colors"
                >
                  {expandedId === article.id ? "▲ Less" : "▼ Preview"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl   transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed">
            ← Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === i ? "bg-slate-800 dark:bg-slate-600 text-white" : "text-slate-500 dark:text-slate-400  "}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl   transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      )}

      {/* Still need help */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">Can&apos;t find what you&apos;re looking for?</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Our support team is ready to help. Raise a ticket and we&apos;ll get back to you.</p>
        </div>
        <a href="/dashboard/create" className="flex-shrink-0 px-6 py-2.5 bg-slate-800 dark:bg-slate-700 text-white text-sm font-bold rounded-xl   transition-colors">
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
