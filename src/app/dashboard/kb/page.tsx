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

const FAQ_ITEMS = [
  { q: "How do I request annual / earned leave?", a: "Submit your leave via the HRMS portal. Planning ahead is required: 1–3 days needs 2 days' notice; 3–5 days needs 1 week; more than 5 days needs 2 weeks. Your Karma Staff Manager and Client Representative must approve it. You accrue 18 Earned Leave days per year (1.5 per month). Maximum 3 leaves can be carried forward annually.", type: "HR" },
  { q: "What is the dress code policy?", a: "Formal or semi-formal attire is required Monday to Thursday. Fridays allow a relaxed dress code. Ripped jeans, shorts, or unprofessional attire are never acceptable. For client meetings, full formal or company uniform is required. Non-compliance results in a verbal warning (₹500 fine) on the first instance, escalating to written warnings on repeat.", type: "HR" },
  { q: "When does health insurance start?", a: "You become eligible for the company health insurance plan from Day 31 of employment. The plan covers you, your spouse, and your child, and is fully funded by Karma Staff.", type: "HR" },
  { q: "When do I get paid and how does payroll work?", a: "Salaries are processed on or before the 7th working day of the following month, deposited directly to your approved bank account. Keep your bank details up to date. New trainees receive a stipend during their first month of training.", type: "HR" },
  { q: "What happens if I'm late to log in?", a: "Arriving after 8:30 a.m. is counted as a half day. Logging in after your exact shift start time on Time Champ is a late login and impacts your Monthly KPI. First instance: verbal warning + ₹500 fine. Second: written warning + ₹1,000 fine. Third: final warning + ₹1,000. Fourth: termination. Unpaid fines are deducted from salary after 3 days.", type: "HR" },
  { q: "What is the leave without pay (LOP) policy?", a: "All LOP must be supported by valid documentation. First LOP instance: HR counselling + ineligible for monthly MPR. Second: written warning + ineligible for quarterly MPR. Third: termination following due process. LOP results in proportional salary deductions and may affect performance appraisals.", type: "HR" },
  { q: "How do I reset my password or fix a login issue?", a: "Go to the login page and click 'Forgot Password'. Enter your work email and follow the reset link. If you don't receive it within 5 minutes, check spam. For VPN or system access issues, always use company-provided secure connections. Raise an IT ticket if the problem persists.", type: "IT" },
  { q: "Can I take company equipment home or work remotely?", a: "Office-based employees cannot remove company equipment (laptops, phones, etc.) from the workplace or work from home without explicit prior written approval from management. Unauthorised removal may result in disciplinary action including financial deductions.", type: "IT" },
  { q: "What are the IT and data security rules?", a: "Company systems are for work use only — personal use during work hours is not acceptable. Never duplicate or distribute company software. Use company VPN for sensitive data. We adhere to SOC 2 standards. Report any security incident immediately. Negligent handling of data or assets can result in deductions from your paycheck.", type: "IT" },
  { q: "How do I report a software bug?", a: "Click 'Software Bug' on your dashboard to create a ticket. Include the app name, steps to reproduce, any error messages, and screenshots. Mark as Urgent if it's causing data loss or blocking work. The AI/Software team will pick it up from the Software Bug Queue.", type: "general" },
  { q: "How do I raise a grievance or report misconduct?", a: "Report the matter to your immediate Manager first. If unresolved or the Manager is involved, escalate in writing to higher-level leadership. All grievances are documented, investigated, and responded to in writing within 5 working days. Our open-door policy guarantees no retaliation. Integrity violations (fraud, data breaches, harassment) are zero-tolerance and typically result in termination.", type: "general" },
  { q: "What are the rules around conflicts of interest and gifts?", a: "Disclose any potential conflict of interest to your Manager immediately. Outside business activities that interfere with Karma Staff work are prohibited. Gifts from vendors up to ₹1,000 are acceptable; anything above requires prior manager approval. All gifts must be disclosed to management right away.", type: "general" },
];

const FAQ_TYPE_COLOR: Record<string, string> = {
  IT: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30",
  HR: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
  general: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30",
};

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [page, setPage] = useState(0);
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

      {/* FAQ Section */}
      {!searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{FAQ_ITEMS.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-start gap-3 p-4 text-left   transition-colors"
                >
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${FAQ_TYPE_COLOR[item.type]}`}>
                    {item.type === "general" ? "General" : item.type}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white flex-1 leading-snug">{item.q}</span>
                  <svg className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
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
