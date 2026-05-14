"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import PeopleMarquee from "@/components/landing/PeopleMarquee";
import { useTheme } from "next-themes";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [stats, setStats] = useState({
    totalTickets: "---",
    resolvedTickets: "---",
    totalUsers: "---",
    avgResolutionHours: "---"
  });
  const [activeTab, setActiveTab] = useState("Request");
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    // Fallback data since API is not built yet
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats({
      totalTickets: "1,240",
      resolvedTickets: "1,180",
      totalUsers: "850",
      avgResolutionHours: "1.2"
    });
    
    // Attempt to fetch if API exists
    fetch("/api/public/stats")
      .then(r => r.json())
      .then(data => {
        if (data) {
          setStats({
            totalTickets: data.totalTickets.toLocaleString(),
            resolvedTickets: data.resolvedTickets.toLocaleString(),
            totalUsers: data.totalUsers.toLocaleString(),
            avgResolutionHours: data.avgResolutionHours.toString()
          });
        }
      })
      .catch(() => console.log("Stats API not available yet, using fallback."));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
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
    <div ref={containerRef} className="min-h-screen font-sans bg-white dark:bg-slate-900  text-slate-900 dark:text-white  overflow-x-hidden">
      
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white' : 'bg-white/80 dark:bg-transparent backdrop-blur-sm text-slate-900 dark:text-white'}`}>
        <div className="font-bold tracking-tight text-2xl flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
          <span className="text-slate-900 dark:text-white">Helpdesk</span>
        </div>
        <div className="flex items-center gap-3 font-medium text-sm">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link href="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2">
            Sign In <span>→</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-white dark:bg-[#0a0f1e] overflow-hidden px-6 md:px-12 flex flex-col justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-10"
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80')"}} />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left Column */}
          <div className="space-y-8">
            <div className="hero-element inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              <span className="status-pulse bg-blue-500 dark:bg-blue-400 w-1.5 h-1.5" />
              Internal IT & HR Support Platform
            </div>
            <h1 className="hero-element text-slate-900 dark:text-white text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Deliver exceptional<br/>support at scale.
            </h1>
            <p className="hero-element text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl font-medium">
              Your IT and HR teams — augmented with smart automation, SLA enforcement, and real-time notifications — resolving issues faster than ever.
            </p>
            <div className="hero-element flex flex-col sm:flex-row items-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                Sign In <span>→</span>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-700 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-xl font-bold text-lg transition-all border border-slate-900 dark:border-white/10 flex items-center justify-center gap-2">
                ↓ See how it works
              </a>
            </div>

            <hr className="border-slate-200 dark:border-white/10 my-8" />

            {/* Stats Bar */}
            <div className="hero-element grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
              <div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalTickets}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Tickets Managed</p>
              </div>
              <div className="border-l border-slate-200 dark:border-white/10 pl-6 hidden md:block">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.resolvedTickets}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Issues Resolved</p>
              </div>
              <div className="border-l border-slate-200 dark:border-white/10 pl-6 hidden md:block">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Active Users</p>
              </div>
              <div className="border-l border-slate-200 dark:border-white/10 pl-6 hidden md:block">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.avgResolutionHours}h</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Avg Resolution</p>
              </div>
              {/* Fallback for mobile if grid collapses */}
              <div className="md:hidden">
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.resolvedTickets}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Issues Resolved</p>
              </div>
            </div>
          </div>

          {/* Right Column — Animated Feature Card Stack */}
          <div className="relative h-[400px] flex items-center justify-center">
            {/* Background glow */}
            <div className="glow-orb w-[400px] h-[400px] bg-blue-600/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="relative w-full max-w-md">
              {[
                {
                  id: 0,
                  title: "New Ticket Received",
                  icon: "🎫",
                  details: [
                    "Title: VPN not connecting",
                    "Type: IT  Priority: HIGH",
                    "Assigned to: IT Team",
                    "SLA: 4h response · 24h resolve",
                    "● Email sent to IT staff"
                  ]
                },
                {
                  id: 1,
                  title: "Staff Notified",
                  icon: "🔔",
                  details: [
                    "Jordan (IT Staff) assigned",
                    "In-app + Email notification sent",
                    "Status → In Progress",
                    "● SLA timer started"
                  ]
                },
                {
                  id: 2,
                  title: "Ticket Resolved",
                  icon: "✅",
                  details: [
                    "Solution documented",
                    "Employee notified via email",
                    "Resolution time: 1.8h",
                    "SLA: Met ✓   CSAT: ⭐⭐⭐⭐⭐"
                  ]
                },
                {
                  id: 3,
                  title: "Knowledge Base Match",
                  icon: "📚",
                  details: [
                    '&quot;How to reset VPN credentials&quot;',
                    "Article suggested before ticket",
                    "Views: 142   Solved without IT",
                    "● Ticket deflected"
                  ]
                }
              ].map((card, idx) => {
                const isActive = activeCard === idx;
                const isNext = (activeCard + 1) % 4 === idx;

                return (
                  <div
                    key={card.id}
                    className={`absolute top-0 left-0 w-full bg-slate-800 dark:bg-[#111827] border border-slate-700 dark:border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-500 ease-in-out ${
                      isActive ? 'opacity-100 transform-none z-30' :
                      isNext ? 'opacity-40 translate-y-5 scale-95 z-20' :
                      'opacity-0 -translate-y-5 scale-90 z-10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{card.icon}</span>
                      <h3 className="font-bold text-lg text-white">{card.title}</h3>
                    </div>
                    <hr className="border-white/5 mb-4" />
                    <ul className="space-y-2 text-sm text-slate-400 font-mono">
                      {card.details.map((detail, i) => (
                        <li key={i} className={detail.startsWith('●') ? 'text-blue-400' : ''}>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Capability Marquee */}
      <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Everything your team needs</h2>
        </div>
        
        <div className="relative flex overflow-x-hidden">
          <div className="py-4 animate-marquee flex gap-4 whitespace-nowrap">
            {[
              "🎫 Ticket Management", "⏱ SLA Enforcement", "🔔 Smart Notifications",
              "📚 Knowledge Base", "📊 Manager Reports", "🤖 Automation Rules",
              "👥 Role-Based Access", "📧 Email Alerts"
            ].map((pill, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 whitespace-nowrap hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
                {pill}
              </div>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div className="py-4 animate-marquee flex gap-4 whitespace-nowrap absolute top-0" style={{ transform: 'translateX(100%)' }}>
            {[
              "🎫 Ticket Management", "⏱ SLA Enforcement", "🔔 Smart Notifications",
              "📚 Knowledge Base", "📊 Manager Reports", "🤖 Automation Rules",
              "👥 Role-Based Access", "📧 Email Alerts"
            ].map((pill, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 whitespace-nowrap hover:border-blue-200 dark:hover:border-blue-500/50 transition-colors">
                {pill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-slate-100 dark:bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">From request to resolution</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">Four steps. Zero friction.</p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full p-1">
              {["Request", "Notify", "Resolve", "Learn"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    activeTab === tab ? 'bg-slate-900 dark:bg-slate-900 text-white' : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-800 dark:bg-[#111827] border border-slate-700 dark:border-white/10 rounded-3xl p-8 md:p-12 min-h-[300px] flex flex-col justify-center">
            {activeTab === "Request" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Employee submits a ticket</h3>
                  <p className="text-slate-400 dark:text-slate-400 text-lg">IT or HR request form with smart fields — category, priority auto-suggested, SLA attached instantly.</p>
                </div>
                <div className="bg-[#0a0f1e] dark:bg-[#0a0f1e] p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Title</div>
                    <div className="bg-white dark:bg-slate-900/5 rounded-lg p-3 text-white/40">E.g., VPN not connecting</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Type</div>
                      <div className="bg-white dark:bg-slate-900/5 rounded-lg p-3 text-white/40">IT</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Priority</div>
                      <div className="bg-white dark:bg-slate-900/5 rounded-lg p-3 text-white/40">High</div>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-bold">Submit Ticket</button>
                </div>
              </div>
            )}

            {activeTab === "Notify" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Staff are notified instantly</h3>
                  <p className="text-slate-400 dark:text-slate-400 text-lg">In-app notification bell + email fires to every active IT or HR staff member the moment a ticket is created.</p>
                </div>
                <div className="flex justify-center">
                  <div className="relative bg-[#0a0f1e] dark:bg-[#0a0f1e] p-6 rounded-2xl border border-white/10 max-w-sm w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">Notifications</h4>
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">2</div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white dark:bg-slate-900/5 p-3 rounded-lg text-sm text-slate-300">
                        <span className="font-bold text-white">New IT Ticket:</span> &quot;VPN not connecting&quot; assigned to IT queue.
                      </div>
                      <div className="bg-white dark:bg-slate-900/5 p-3 rounded-lg text-sm text-slate-300">
                        <span className="font-bold text-white">New HR Ticket:</span> &quot;Payroll inquiry&quot; assigned to HR queue.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Resolve" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Staff works and resolves</h3>
                  <p className="text-slate-400 dark:text-slate-400 text-lg">Staff marks in-progress, posts updates, then resolves with a documented solution. Employee gets email confirmation.</p>
                </div>
                <div className="bg-[#0a0f1e] dark:bg-[#0a0f1e] p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Ticket #124</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">Resolved</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/5 p-4 rounded-lg text-sm text-slate-300">
                    <span className="font-bold text-white">Solution:</span> Reset user credentials and updated VPN client config. Verified working.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Learn" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Knowledge compounds over time</h3>
                  <p className="text-slate-400 dark:text-slate-400 text-lg">Every resolution builds the Knowledge Base. Employees find answers before raising tickets. Fewer tickets, faster outcomes.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0f1e] dark:bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">VPN Setup</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">142 views</div>
                  </div>
                  <div className="bg-[#0a0f1e] dark:bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">Printer Map</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">89 views</div>
                  </div>
                  <div className="bg-[#0a0f1e] dark:bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">Wifi Pass</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">204 views</div>
                  </div>
                  <div className="bg-[#0a0f1e] dark:bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">Holiday Cal</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">67 views</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Animated People Marquee */}
      <PeopleMarquee />

      {/* Features Grid */}
      <section className="reveal-section py-20 md:py-24 px-6 md:px-12 bg-white dark:bg-slate-900 ">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white ">Built for every team member</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 ">Tailored experiences for employees, staff, and managers.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
              {/* Employee */}
            <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-3xl p-8 hover:shadow-lg hover:border-blue-100 transition-all" style={{ borderTop: '3px solid #2563eb' }}>
              <div className="w-12 h-12 bg-blue-100  rounded-xl flex items-center justify-center text-blue-600  mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white ">Employee</h3>
              <p className="text-slate-600 dark:text-slate-300  mb-6">Submit IT or HR requests in seconds. Track progress live.</p>
              <ul className="space-y-3 text-sm text-slate-700 ">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Submit IT & HR tickets in seconds
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Live status tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  In-app & email notifications
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Knowledge Base self-service
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  CSAT rating after resolution
                </li>
              </ul>
            </div>

            {/* IT & HR Staff */}
            <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-3xl p-8 hover:shadow-lg hover:border-orange-100 transition-all" style={{ borderTop: '3px solid #f97316' }}>
              <div className="w-12 h-12 bg-orange-100  rounded-xl flex items-center justify-center text-orange-500  mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white ">IT & HR Staff</h3>
              <p className="text-slate-600 dark:text-slate-300  mb-6">Manage your queue, document solutions, hit SLA targets.</p>
              <ul className="space-y-3 text-sm text-slate-700 ">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Smart ticket queue with filters
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  SLA deadline visibility
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Solution documentation
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Instant new-ticket alerts
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Ticket history & audit log
                </li>
              </ul>
            </div>

            {/* Manager */}
            <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-3xl p-8 hover:shadow-lg hover:border-purple-100 transition-all" style={{ borderTop: '3px solid #9333ea' }}>
              <div className="w-12 h-12 bg-purple-100  rounded-xl flex items-center justify-center text-purple-600  mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L3 18"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white ">Manager</h3>
              <p className="text-slate-600 dark:text-slate-300  mb-6">Full visibility into team performance and operational health.</p>
              <ul className="space-y-3 text-sm text-slate-700 ">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  14-day activity bar chart
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  SLA compliance tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Staff performance table
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Resolution rate KPIs
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  Ticket export (CSV)
                </li>
              </ul>
            </div>
            </div>
            <div className="hidden lg:block">
              <img src="/team_collaboration.png" alt="Team collaboration" className="rounded-2xl object-cover h-[500px] w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Final Sign-In CTA */}
      <section className="reveal-section py-20 md:py-24 px-6 md:px-12 bg-white dark:bg-slate-900 ">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-[#0a0f1e] border border-white/10 rounded-3xl p-16 text-white grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-extrabold mb-4">Already part of the team?</h2>
              <p className="text-slate-400 dark:text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0">Sign in to access your dashboard and tickets.</p>
              <Link href="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 inline-flex items-center gap-2">
                Sign In <span>→</span>
              </Link>
            </div>
            <div className="hidden lg:block">
              <img src="/person_at_laptop.png" alt="Person at laptop" className="rounded-2xl object-cover h-64 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 dark:text-slate-400 px-6 py-8 md:px-12 border-t border-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Karma Staff Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
