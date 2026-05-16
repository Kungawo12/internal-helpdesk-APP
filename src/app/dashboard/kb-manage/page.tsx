"use client";

import { useEffect, useState } from "react";

type KbArticle = {
  id: string;
  title: string;
  content: string;
  type: "IT" | "HR" | "general";
  tags: string;
  views: number;
  published: boolean;
  createdAt: string;
  author: { name: string };
};

const TYPE_COLOR: Record<string, string> = {
  IT: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  HR: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  general: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

export default function KbManagementPage() {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "general" as "IT" | "HR" | "general",
    tags: "",
    published: true,
    content: "",
  });

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

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/kb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsFormOpen(false);
        setFormData({
          title: "",
          type: "general",
          tags: "",
          published: true,
          content: "",
        });
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/kb/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/kb/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchArticles();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-white/10 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16 page-reveal bg-white dark:bg-slate-900 rounded-3xl p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-widest mb-2">Admin Portal</p>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Knowledge Base</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage self-service articles</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-primary"
        >
          {isFormOpen ? "Close Form" : "＋ New Article"}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
        <div className="flex gap-2">
          {["All", "IT", "HR", "general"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
                filterType === t
                  ? "bg-red-500 text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800/5 text-slate-500 dark:text-slate-400  dark:bg-slate-800/10"
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
            className="w-full bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* New Article Form */}
      {isFormOpen && (
        <div className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 page-reveal">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-5">Create New Article</h2>
          <form onSubmit={handleCreateArticle} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="e.g. How to connect to VPN"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                <div className="flex gap-3">
                  {(["IT", "HR", "general"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all capitalize ${
                        formData.type === t
                          ? "bg-red-500 text-slate-900 dark:text-white border-red-600"
                          : "bg-slate-100 dark:bg-slate-800/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10  dark:bg-slate-800/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Tags</label>
                <input
                  type="text"
                  className="w-full bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="vpn, wifi, password (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800/5 text-red-500 focus:ring-red-500/50"
                />
                <label htmlFor="published" className="text-sm font-bold text-slate-600 dark:text-white/70 cursor-pointer">
                  Publish immediately
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Content</label>
                <textarea
                  required
                  rows={10}
                  className="w-full bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-red-500/50 transition-colors font-mono text-sm"
                  placeholder="Write article content here (Markdown supported)..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 justify-end">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800/5  dark:bg-slate-800/10 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-900 dark:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary px-6"
              >
                Save Article
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Article List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.length === 0 ? (
          <div className="md:col-span-2 bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400 italic">
            No articles yet. Create the first one to help users self-serve.
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="bg-slate-100 dark:bg-slate-800/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6  dark:bg-slate-800/8 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLOR[article.type]}`}>
                    {article.type}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    👁 {article.views}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{article.title}</h3>
                
                {article.tags && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {article.tags.split(",").map((tag) => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/5 text-slate-500 dark:text-white/50">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex justify-between items-center mt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-slate-500 dark:text-white/50">{article.author.name}</p>
                  <p>{new Date(article.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePublished(article.id, article.published)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      article.published
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                    }`}
                  >
                    {article.published ? "Published" : "Draft"}
                  </button>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30  transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
