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

type AiSearchResult = {
  answer: string | null;
  articles: KbArticle[];
};

type Suggestion = {
  question: string;
  category: string;
};

const TYPE_BADGE: Record<string, string> = {
  IT: "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100 border border-blue-200",
  HR: "bg-amber-100 text-amber-700 border border-amber-200",
  general: "bg-emerald-100 text-emerald-700 border border-emerald-200",
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

function KbPortal() {
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");
  const [page, setPage] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiResult, setAiResult] = useState<AiSearchResult | null>(null);
  const [aiSearching, setAiSearching] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

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

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const res = await fetch("/api/kb/ai-suggestions");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      }
    } catch {
      // ignore
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const runAiSearch = async (q: string) => {
    if (!q.trim() || q.trim().length < 3) return;
    setAiSearching(true);
    setAiResult(null);
    try {
      const res = await fetch(`/api/kb/ai-search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) setAiResult(await res.json());
    } catch {
      // ignore
    } finally {
      setAiSearching(false);
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
  useEffect(() => { fetchSuggestions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(0); }, [filterType]);

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (articleId) fetchArticleDetail(articleId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!searchQuery) { setAiResult(null); return; }
    const timer = setTimeout(() => runAiSearch(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setAiResult(null);
    searchRef.current?.focus();
  };

  const filtered = articles;
  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const visible = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  // ── Article Detail View ──────────────────────────────────────────────────
  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 page-reveal">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors flex items-center gap-1.5"
        >
          ← Back to Knowledge Base
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${TYPE_BADGE[selectedArticle.type]}`}>
              {TYPE_ICON[selectedArticle.type]} {selectedArticle.type === "general" ? "General" : selectedArticle.type}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-400">👁 {selectedArticle.views} views</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            {selectedArticle.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400">{selectedArticle.author.name}</span>
            <span>·</span>
            <span>{new Date(selectedArticle.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
            {selectedArticle.content}
          </div>

          {selectedArticle.tags && (
            <div className="flex flex-wrap gap-1.5 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              {selectedArticle.tags.split(",").map((tag) => (
                <span key={tag} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-sm font-bold text-blue-800 mb-1">Still need help?</p>
          <p className="text-sm text-blue-600">
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
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-400 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📚</span>
            <span className="text-xs font-black uppercase tracking-widest opacity-50">Help Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Knowledge Base</h1>
          <p className="opacity-60 mb-8 text-base">
            {articles.length > 0 ? `${articles.length} articles` : "Loading articles..."} — ask anything, AI will find the answer
          </p>
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <input
              ref={searchRef}
              type="text"
              placeholder="Ask anything — e.g. how do I reset my password?"
              className="w-full bg-white dark:bg-slate-900/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 pr-32 text-white placeholder:text-white/50 focus:outline-none focus:bg-white dark:bg-slate-900/15 focus:border-white/40 transition-all text-base"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              {searchInput && (
                <button type="button" onClick={clearSearch} className="px-3 py-2 text-white/60 hover:text-white text-sm transition-colors">
                  ✕
                </button>
              )}
              <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-colors">
                {aiSearching ? "..." : "Ask AI"}
              </button>
            </div>
          </form>
          <p className="text-[11px] opacity-40 mt-2 ml-1">Powered by GPT-4o — reads every article to find the best answer</p>
        </div>
      </div>

      {/* AI Search Results */}
      {(aiSearching || aiResult) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">AI Answer</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-400">&ldquo;{searchQuery}&rdquo;</span>
              <button onClick={clearSearch} className="text-xs text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 font-semibold transition-colors">Clear ✕</button>
            </div>
          </div>
          {aiSearching ? (
            <div className="px-6 py-8 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Searching knowledge base with AI...</span>
            </div>
          ) : aiResult && (
            <div className="p-6 space-y-5">
              {aiResult.answer && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Direct Answer</p>
                  <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{aiResult.answer}</p>
                </div>
              )}
              {aiResult.articles.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-3">Relevant Articles ({aiResult.articles.length})</p>
                  <div className="space-y-2">
                    {aiResult.articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => fetchArticleDetail(article.id)}
                        className={`w-full text-left p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-300 hover:shadow-sm transition-all group ${TYPE_LEFT[article.type]}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_BADGE[article.type]}`}>
                              {article.type === "general" ? "Gen" : article.type}
                            </span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 transition-colors leading-snug">
                              {article.title}
                            </span>
                          </div>
                          <span className="text-slate-300 text-sm flex-shrink-0 group-hover:text-orange-400 transition-colors">→</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-12 line-clamp-1">
                          {article.content?.slice(0, 120)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No articles found. <a href="/dashboard/create" className="text-blue-600 underline">Raise a ticket</a> and our team will help.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {!aiResult && !aiSearching && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✨</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Questions Employees Are Asking</p>
                <p className="text-xs text-slate-400 dark:text-slate-400">AI-predicted from recent ticket patterns — click to search</p>
              </div>
            </div>
            <button onClick={fetchSuggestions} className="text-xs text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 font-semibold transition-colors">
              Refresh ↺
            </button>
          </div>
          {suggestionsLoading ? (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {suggestions.slice(0, 10).map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSearchInput(s.question); setSearchQuery(s.question); }}
                  className="flex items-start gap-3 p-3 text-left rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors group border border-transparent hover:border-slate-200 dark:border-slate-700"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                    s.category === "IT" ? TYPE_BADGE.IT : s.category === "HR" ? TYPE_BADGE.HR : TYPE_BADGE.general
                  }`}>
                    {s.category === "general" ? "Gen" : s.category}
                  </span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors leading-snug">{s.question}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category filter */}
      {!aiResult && (
        <div className="flex flex-wrap items-center gap-2">
          {(["All", "IT", "HR", "general"] as const).map((t) => {
            const count = t === "All" ? articles.length : articles.filter((a) => a.type === t).length;
            return (
              <button
                key={t}
                onClick={() => { setFilterType(t); setPage(0); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 border ${
                  filterType === t
                    ? "bg-slate-800 dark:bg-slate-900 text-white border-slate-800 dark:border-slate-900"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50"
                }`}
              >
                {t === "IT" ? "💻" : t === "HR" ? "👥" : t === "general" ? "📖" : "🗂️"}
                {t === "general" ? "General" : t}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterType === t ? "bg-white dark:bg-slate-900/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-400 font-medium">{filtered.length} article{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Article Grid */}
      {!aiResult && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse">
                  <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
                  <div className="h-5 bg-slate-200 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded mb-4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded mb-1.5" />
                  <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-20 text-center">
              <div className="text-6xl mb-4 opacity-20">📚</div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No articles found</h3>
              <p className="text-slate-400 dark:text-slate-400 text-sm">Try the AI search above or browse a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((article) => (
                <div
                  key={article.id}
                  className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all flex flex-col ${TYPE_LEFT[article.type]}`}
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[article.type]}`}>
                        {TYPE_ICON[article.type]} {article.type === "general" ? "General" : article.type}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400">👁 {article.views}</span>
                    </div>

                    <h3
                      onClick={() => fetchArticleDetail(article.id)}
                      className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      {article.title}
                    </h3>

                    <div className={`overflow-hidden transition-all duration-300 ${expandedId === article.id ? "max-h-96" : "max-h-0"}`}>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2 pb-3">
                        {article.content?.slice(0, 400)}{(article.content?.length ?? 0) > 400 ? "..." : ""}
                      </p>
                      <button onClick={() => fetchArticleDetail(article.id)} className="text-xs font-bold text-orange-600 hover:text-orange-500 transition-colors">
                        Read full article →
                      </button>
                    </div>

                    {expandedId !== article.id && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {article.content?.slice(0, 90) ?? ""}...
                      </p>
                    )}
                  </div>

                  <div className="px-5 pb-4 pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1">
                      {article.tags?.split(",").slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
                      className="text-[11px] font-bold text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 transition-colors"
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
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === i ? "bg-slate-900 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-all text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Still need help */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-200">Can&apos;t find what you&apos;re looking for?</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Our support team is ready to help. Raise a ticket and we&apos;ll get back to you.</p>
        </div>
        <a href="/dashboard/create" className="flex-shrink-0 px-6 py-2.5 bg-slate-800 dark:bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-colors">
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
