"use client";

import { Suspense, useEffect, useState } from "react";
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


function KbPortal() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KbArticle | null>(null);
  const [page, setPage] = useState(0);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = "/api/kb";
      const params = new URLSearchParams();
      if (filterType !== "All") params.append("type", filterType);
      if (searchQuery) params.append("q", searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        setArticles(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [filterType, searchQuery]);

  const fetchArticleDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/kb/${id}`);
      if (res.ok) {
        setSelectedArticle(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const articleId = searchParams.get("article");
    if (articleId) fetchArticleDetail(articleId);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filterType, searchQuery]);

  const CARDS_PER_PAGE = 9;
  const totalPages = Math.ceil(articles.length / CARDS_PER_PAGE);
  const visible = articles.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  const TYPE_COLOR_DARK: Record<string, string> = {
    IT: "bg-blue-500/15 text-blue-400 border border-blue-400/20",
    HR: "bg-amber-500/15 text-amber-400 border border-amber-400/20",
    general: "bg-slate-500/15 text-slate-300 border border-slate-400/20",
  };

  const BORDER_COLOR_DARK: Record<string, string> = {
    IT: "border-l-4 border-l-blue-500",
    HR: "border-l-4 border-l-amber-500",
    general: "border-l-4 border-l-slate-500",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] rounded-2xl p-6 -m-4 md:-m-6 text-slate-900 dark:text-white">
      {selectedArticle ? (
        <div className="max-w-4xl mx-auto space-y-6 pb-16 page-reveal">
          <button
            onClick={() => setSelectedArticle(null)}
            className="text-sm font-bold text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1"
          >
            ← Back to articles
          </button>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-3xl p-8">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR_DARK[selectedArticle.type]}`}>
                {selectedArticle.type}
              </span>
              <span className="text-xs text-slate-500 dark:text-white/40 flex items-center gap-1">
                👁 {selectedArticle.views} views
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">{selectedArticle.title}</h1>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50 mb-8 border-b border-slate-100 dark:border-white/5 pb-4">
              <span className="font-bold text-slate-700 dark:text-white/70">{selectedArticle.author.name}</span>
              <span>·</span>
              <span>{new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-white/80 leading-relaxed text-base">
                {selectedArticle.content}
              </pre>
            </div>

            {selectedArticle.tags && (
              <div className="flex flex-wrap gap-1 mt-8 pt-4 border-t border-slate-100 dark:border-white/5">
                {selectedArticle.tags.split(",").map((tag) => (
                  <span key={tag} className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/40 border border-slate-200 dark:border-white/10">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 max-w-6xl pb-16 page-reveal">
          {/* Header */}
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-sm" /> HELP CENTER
            </p>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Knowledge Base</h1>
            <p className="text-slate-500 dark:text-white/50 mt-1 text-sm font-medium">Browse guides and find answers before raising a ticket</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-4">
            <div className="flex gap-2">
              {["All", "IT", "HR", "general"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                    filterType === t
                      ? "bg-orange-500 text-white"
                      : "border border-slate-200 dark:border-white/20 text-slate-600 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20 focus:outline-none focus:border-orange-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Article Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-slate-200 dark:border-white/10 animate-pulse">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded mb-3" />
                  <div className="h-5 bg-slate-200 dark:bg-white/10 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-4" />
                  <div className="h-3 bg-slate-100 dark:bg-white/5 rounded mb-1.5" />
                  <div className="h-3 w-5/6 bg-slate-100 dark:bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-white/40 font-medium">
              No articles found. Try a different search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((article) => (
                <div
                  key={article.id}
                  onClick={() => fetchArticleDetail(article.id)}
                  className={`group bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-orange-400/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] transition-all cursor-pointer flex flex-col justify-between ${BORDER_COLOR_DARK[article.type]}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR_DARK[article.type]}`}>
                        {article.type}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-white/40 flex items-center gap-1">
                        👁 {article.views}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">{article.title}</h3>

                    {article.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.split(",").map((tag) => (
                          <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/40 border border-slate-200 dark:border-white/10">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex justify-between items-center mt-4 text-xs text-slate-500 dark:text-white/50">
                    <span className="font-bold text-slate-700 dark:text-white/70">{article.author.name}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end mt-10 gap-4">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`border border-slate-200 dark:border-white/20 text-slate-600 dark:text-white/70 px-5 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm font-medium ${page === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                ← Prev
              </button>
              <span className="text-slate-600 dark:text-white/50 text-sm font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className={`border border-slate-200 dark:border-white/20 text-slate-600 dark:text-white/70 px-5 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-sm font-medium ${page === totalPages - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function KbPortalPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin" />
      </div>
    }>
      <KbPortal />
    </Suspense>
  );
}
