"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Hero elements reveal
      gsap.fromTo(
        ".hero-element",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      );

      // Section fades on scroll
      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: sec,
              start: "top 85%",
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
          }
        );
      });
      
      // Staggered cards reveal
      gsap.utils.toArray<HTMLElement>(".stagger-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".stagger-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            scrollTrigger: {
              trigger: grid,
              start: "top 80%",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
          }
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen font-sans bg-[#f8fafc] text-slate-900 overflow-x-hidden">
      
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 text-white transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-lg shadow-black/20 border-b border-white/5' : 'bg-transparent border-b border-transparent'}`}>
        <div className="font-bold tracking-tight text-2xl flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
          <span>Helpdesk</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Sign In</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 md:pt-48 md:pb-40 bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden px-6 md:px-12">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDM5LjVoNDBWMGgtMXYzOXoiIGZpbGw9InJnYmEoMjU1LDExNSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="glow-orb w-[600px] h-[600px] bg-blue-600/20 -top-40 -left-40" />
        <div className="glow-orb w-[400px] h-[400px] bg-cyan-500/10 top-1/2 right-0" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="hero-element inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            <span className="status-pulse bg-blue-400 w-1.5 h-1.5" />
            Now Live — Internal Helpdesk Platform
          </div>
          <h1 className="hero-element text-white text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            The unified support platform for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300" style={{ backgroundSize: '200%', animation: 'gradient-shift 4s ease infinite' }}>modern teams</span>.
          </h1>
          <p className="hero-element text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
            Streamline internal requests, empower your IT and HR staff, and give managers the visibility they need to scale operations smoothly.
          </p>
          <div className="hero-element flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <Link href="/login" className="btn-pulse w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20">
              Sign In
            </Link>
          </div>

          {/* Pure CSS Dashboard Mockup */}
          <div className="hero-element relative mx-auto max-w-5xl rounded-t-2xl border border-white/10 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Mockup Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-slate-800/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto px-4 py-1.5 rounded-md bg-slate-950/50 text-xs font-mono text-slate-400 flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                helpdesk.internal
              </div>
            </div>
            {/* Mockup Content */}
            <div className="flex h-[400px]">
              {/* Sidebar */}
              <div className="hidden md:block w-48 bg-slate-900 p-4 space-y-2 flex-shrink-0">
                <div className="h-4 w-20 bg-blue-600 rounded mb-6" />
                {['Dashboard','Tickets','Staff Queue','Overview'].map((item,i) => (
                  <div key={i} className={`h-8 rounded-lg flex items-center px-3 ${i===0?'bg-white/10':''}`}>
                    <div className={`h-3 rounded ${i===0?'w-20 bg-white':'w-16 bg-slate-700'}`} />
                  </div>
                ))}
              </div>
              <div className="flex-1 p-6 md:p-8 bg-slate-50 text-left overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">Dashboard Overview</h3>
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">JD</div>
              </div>
              
              {/* Fake Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase">Open Tickets</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">12</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase">Resolved</p>
                  <p className="text-3xl font-extrabold text-blue-600 mt-1">108</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hidden md:block">
                  <p className="text-xs font-bold text-slate-500 uppercase">Avg Resolution</p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-1">1.2h</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hidden md:block">
                  <p className="text-xs font-bold text-slate-500 uppercase">CSAT Score</p>
                  <p className="text-3xl font-extrabold text-green-600 mt-1">4.9</p>
                </div>
              </div>

              {/* Fake Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 p-4 flex justify-between">
                  <div className="w-1/2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">!</div>
                    <div>
                      <div className="h-4 w-32 bg-slate-800 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-slate-300 rounded"></div>
                    </div>
                  </div>
                  <div className="w-1/4 hidden md:flex items-center">
                    <div className="h-6 w-16 bg-amber-100 rounded-full"></div>
                  </div>
                </div>
                <div className="border-b border-slate-100 p-4 flex justify-between">
                  <div className="w-1/2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                    <div>
                      <div className="h-4 w-40 bg-slate-800 rounded mb-2"></div>
                      <div className="h-3 w-24 bg-slate-300 rounded"></div>
                    </div>
                  </div>
                  <div className="w-1/4 hidden md:flex items-center">
                    <div className="h-6 w-20 bg-blue-100 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 flex justify-between">
                  <div className="w-1/2 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                    <div>
                      <div className="h-4 w-28 bg-slate-800 rounded mb-2"></div>
                      <div className="h-3 w-16 bg-slate-300 rounded"></div>
                    </div>
                  </div>
                  <div className="w-1/4 hidden md:flex items-center">
                    <div className="h-6 w-16 bg-green-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            
            
            {/* Fade Out Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="reveal-section py-10 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-12 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Trusted by innovative teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale">
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 rounded-full bg-black"></div> ACME Corp</div>
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 rotate-45 bg-black"></div> Globex</div>
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 rounded bg-black"></div> Initech</div>
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 rounded-tl-full rounded-br-full bg-black"></div> Soylent</div>
            <div className="flex items-center gap-2 font-black text-xl"><div className="w-6 h-6 rounded-t-full bg-black"></div> Umbrella</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Everything you need to resolve issues fast.</h2>
            <p className="text-lg text-slate-500">A complete toolset designed to eliminate bottlenecks and empower your team.</p>
          </div>
          
          <div className="stagger-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "📝", title: "Ticket Creation", desc: "Frictionless submission forms tailored for any request type." },
              { icon: "⏱️", title: "Real-Time Tracking", desc: "Know exactly where your request stands with live status updates." },
              { icon: "📨", title: "Email Alerts", desc: "Automated notifications keep everyone in the loop instantly." },
              { icon: "🔐", title: "Role-Based Access", desc: "Secure environments tailored for employees, staff, and managers." },
              { icon: "🗄️", title: "Solution Database", desc: "Automatically log resolutions to build a powerful knowledge base." },
              { icon: "⭐", title: "Feedback System", desc: "Collect CSAT ratings to measure and improve support quality." }
            ].map((feature, i) => (
              <div key={i} className="stagger-card p-8 rounded-2xl bg-[#f8fafc] border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all" style={{ borderTop: '3px solid', borderTopColor: ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981','#f43f5e'][i] }}>
                <div className="text-3xl mb-4 bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-sm hover:scale-110 transition-transform cursor-default">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">A frictionless workflow.</h2>
            <p className="text-lg text-slate-400">From request to resolution in four simple steps.</p>
          </div>
          
          <div className="stagger-grid grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/30 via-blue-500/60 to-blue-500/30 z-0"></div>
            
            {[
              { icon: "📝", title: "Submit", desc: "Employee fills out a simple request form." },
              { icon: "🔔", title: "Notified", desc: "The right staff member gets an instant alert." },
              { icon: "✅", title: "Resolved", desc: "Staff works the ticket and logs the solution." },
              { icon: "⭐", title: "Feedback", desc: "Employee confirms and rates the service." }
            ].map((item, i) => (
              <div key={i} className="stagger-card relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center text-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-shadow mb-6 shadow-xl">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-[#f8fafc]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Built for every team member.</h2>
            <p className="text-lg text-slate-500">Customized experiences ensure everyone has exactly what they need.</p>
          </div>
          
          <div className="stagger-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                role: "Employee", 
                icon: "👤",
                desc: "The core users requesting assistance.",
                bullets: ["Submit IT & HR tickets in seconds", "Track live progress of requests", "Rate resolution quality"]
              },
              { 
                role: "IT & HR Staff", 
                icon: "🛠️",
                desc: "The experts resolving the issues.",
                bullets: ["Manage active ticket queues", "Document resolution steps", "Access historical solutions"]
              },
              { 
                role: "Manager", 
                icon: "💼",
                desc: "The leaders overseeing operations.",
                bullets: ["Monitor volume and KPI charts", "Track SLA and resolution times", "Audit department performance"]
              }
            ].map((role, i) => (
              <div key={i} className="stagger-card bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-4xl mb-6">{role.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{role.role}</h3>
                <p className="text-slate-600 mb-6 pb-6 border-b border-slate-100">{role.desc}</p>
                <ul className="space-y-4">
                  {role.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-3 text-slate-700 font-medium">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live News Feed */}
      <NewsSection />

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 px-6 py-12 md:px-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-white text-xl">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs">H</div>
            <span>Helpdesk</span>
          </div>
          <div className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Helpdesk Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Live News Feed Section ───────────────────────────────────────────────────
interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: "Technology" | "Business";
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"All" | "Technology" | "Business">("All");

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 3600000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filtered = filter === "All" ? news : news.filter(n => n.category === filter);

  return (
    <section className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full mb-3 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Feed — Updates Every Hour
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Technology &amp; Business News</h2>
            {lastUpdated && (
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Last updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(["All", "Technology", "Business"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
                <div className="h-5 bg-slate-200 rounded mb-2" />
                <div className="h-5 w-3/4 bg-slate-200 rounded mb-4" />
                <div className="h-3 bg-slate-100 rounded mb-1.5" />
                <div className="h-3 w-5/6 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium">No news available right now. Check back shortly.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${item.category === "Technology" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{timeAgo(item.pubDate)}</span>
                </div>
                <h3 className="font-bold text-slate-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1 mb-4">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400">{item.source}</span>
                  <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
