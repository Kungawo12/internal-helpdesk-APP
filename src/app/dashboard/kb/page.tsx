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

const TYPE_COLOR: Record<string, string> = {
  IT: "bg-blue-50 text-blue-700 border border-blue-100",
  HR: "bg-amber-50 text-amber-700 border border-amber-100",
  general: "bg-slate-50 text-slate-700 border border-slate-100",
};

function KbPortal() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KbArticle | null>(null);

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

  // Auto-open article if ?article=id is in the URL (e.g. from deflection links)
  useEffect(() => {
    const articleId = searchParams.get("article");
    if (articleId) fetchArticleDetail(articleId);
  }, []);

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16 page-reveal">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          ← Back to articles
        </button>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLOR[selectedArticle.type]}`}>
              {selectedArticle.type}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              👁 {selectedArticle.views} views
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">{selectedArticle.title}</h1>

          <div className="flex items-center gap-2 text-xs text-slate-500 mb-8 border-b border-slate-100 pb-4">
            <span className="font-bold text-slate-700">{selectedArticle.author.name}</span>
            <span>·</span>
            <span>{new Date(selectedArticle.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="prose prose-slate max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-base">
              {selectedArticle.content}
            </pre>
          </div>

          {selectedArticle.tags && (
            <div className="flex flex-wrap gap-1 mt-8 pt-4 border-t border-slate-100">
              {selectedArticle.tags.split(",").map((tag) => (
                <span key={tag} className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16 page-reveal">
      {/* Header */}
      <div>
        <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Help Center</p>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Knowledge Base</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Find answers before raising a ticket</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex gap-2">
          {["All", "IT", "HR", "general"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                filterType === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
            className="w-full bg-slate-100 border border-transparent rounded-xl px-4 py-2 text-slate-900 focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Article Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-red-500 rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400 italic shadow-sm">
          No articles found. Try a different search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => fetchArticleDetail(article.id)}
              className="bg-white border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[article.type]}`}>
                    {article.type}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    👁 {article.views}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{article.title}</h3>

                {article.tags && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.split(",").map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-50 pt-4 flex justify-between items-center mt-4 text-xs text-slate-500">
                <span className="font-bold text-slate-700">{article.author.name}</span>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
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
