"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import PeopleMarquee from "@/components/landing/PeopleMarquee";
import { useTheme } from "@/components/providers/ThemeProvider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
    <div ref={containerRef} className="min-h-screen font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-x-hidden">
      
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
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white' : 'bg-transparent text-white'}`}>
        <div className="font-bold tracking-tight text-2xl flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
          <span className={scrolled ? 'text-slate-900 dark:text-white' : 'text-white'}>Helpdesk</span>
        </div>
        <div className="flex items-center gap-3 font-medium text-sm">
          <button
            onClick={toggleTheme}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-colors ${scrolled ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <Link href="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2">
            Sign In <span>→</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-[#0a0f1e] text-white overflow-hidden px-6 md:px-12 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* Left Column */}
          <div className="space-y-8">
            <div className="hero-element inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
              <span className="status-pulse bg-blue-400 w-1.5 h-1.5" />
              Internal IT & HR Support Platform
            </div>
            <h1 className="hero-element text-white text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Deliver exceptional<br/>support at scale.
            </h1>
            <p className="hero-element text-lg md:text-xl text-slate-400 max-w-2xl font-medium">
              Your IT and HR teams — augmented with smart automation, SLA enforcement, and real-time notifications — resolving issues faster than ever.
            </p>
            <div className="hero-element flex flex-col sm:flex-row items-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
                Sign In <span>→</span>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all border border-white/10 flex items-center justify-center gap-2">
                ↓ See how it works
              </a>
            </div>

            <hr className="border-white/10 my-8" />

            {/* Stats Bar */}
            <div className="hero-element grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
              <div>
                <p className="text-3xl font-extrabold text-white">{stats.totalTickets}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Tickets Managed</p>
              </div>
              <div className="border-l border-white/10 pl-6 hidden md:block">
                <p className="text-3xl font-extrabold text-white">{stats.resolvedTickets}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Issues Resolved</p>
              </div>
              <div className="border-l border-white/10 pl-6 hidden md:block">
                <p className="text-3xl font-extrabold text-white">{stats.totalUsers}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Active Users</p>
              </div>
              <div className="border-l border-white/10 pl-6 hidden md:block">
                <p className="text-3xl font-extrabold text-white">{stats.avgResolutionHours}h</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Avg Resolution</p>
              </div>
              {/* Fallback for mobile if grid collapses */}
              <div className="md:hidden">
                <p className="text-3xl font-extrabold text-white">{stats.resolvedTickets}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Issues Resolved</p>
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
                    className={`absolute top-0 left-0 w-full bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-500 ease-in-out ${
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
      <section className="py-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
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
              <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 whitespace-nowrap hover:border-blue-200 transition-colors">
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
              <div key={idx} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 font-bold text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2 whitespace-nowrap hover:border-blue-200 transition-colors">
                {pill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-[#0a0f1e] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">From request to resolution</h2>
            <p className="text-lg text-slate-400">Four steps. Zero friction.</p>
          </div>
          
          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1">
              {["Request", "Notify", "Resolve", "Learn"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                    activeTab === tab ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 md:p-12 min-h-[300px] flex flex-col justify-center">
            {activeTab === "Request" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Employee submits a ticket</h3>
                  <p className="text-slate-400 text-lg">IT or HR request form with smart fields — category, priority auto-suggested, SLA attached instantly.</p>
                </div>
                <div className="bg-[#0a0f1e] p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500">Title</div>
                    <div className="bg-white/5 rounded-lg p-3 text-white/40">E.g., VPN not connecting</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500">Type</div>
                      <div className="bg-white/5 rounded-lg p-3 text-white/40">IT</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-500">Priority</div>
                      <div className="bg-white/5 rounded-lg p-3 text-white/40">High</div>
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
                  <p className="text-slate-400 text-lg">In-app notification bell + email fires to every active IT or HR staff member the moment a ticket is created.</p>
                </div>
                <div className="flex justify-center">
                  <div className="relative bg-[#0a0f1e] p-6 rounded-2xl border border-white/10 max-w-sm w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">Notifications</h4>
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">2</div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300">
                        <span className="font-bold text-white">New IT Ticket:</span> &quot;VPN not connecting&quot; assigned to IT queue.
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300">
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
                  <p className="text-slate-400 text-lg">Staff marks in-progress, posts updates, then resolves with a documented solution. Employee gets email confirmation.</p>
                </div>
                <div className="bg-[#0a0f1e] p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Ticket #124</span>
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">Resolved</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg text-sm text-slate-300">
                    <span className="font-bold text-white">Solution:</span> Reset user credentials and updated VPN client config. Verified working.
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Learn" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Knowledge compounds over time</h3>
                  <p className="text-slate-400 text-lg">Every resolution builds the Knowledge Base. Employees find answers before raising tickets. Fewer tickets, faster outcomes.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">VPN Setup</div>
                    <div className="text-xs text-slate-500">142 views</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">Printer Map</div>
                    <div className="text-xs text-slate-500">89 views</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">Wifi Pass</div>
                    <div className="text-xs text-slate-500">204 views</div>
                  </div>
                  <div className="bg-[#0a0f1e] p-4 rounded-xl border border-white/10">
                    <div className="font-bold text-sm mb-1">Holiday Cal</div>
                    <div className="text-xs text-slate-500">67 views</div>
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
      <section className="reveal-section py-20 md:py-24 px-6 md:px-12 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">Built for every team member</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">Tailored experiences for employees, staff, and managers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Employee */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-lg hover:border-blue-100 transition-all" style={{ borderTop: '3px solid #2563eb' }}>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Employee</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Submit IT or HR requests in seconds. Track progress live.</p>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-lg hover:border-orange-100 transition-all" style={{ borderTop: '3px solid #f97316' }}>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center text-orange-500 dark:text-orange-400 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">IT & HR Staff</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Manage your queue, document solutions, hit SLA targets.</p>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 hover:shadow-lg hover:border-purple-100 transition-all" style={{ borderTop: '3px solid #9333ea' }}>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="M18.7 8l-5.1 5.2-2.8-2.7L3 18"></path></svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Manager</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Full visibility into team performance and operational health.</p>
              <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
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
        </div>
      </section>

      {/* Trust & Security */}
      <section className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-[#0a0f1e] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-4">You&apos;re always in control</h2>
            <p className="text-lg text-slate-400">Enterprise-grade security and access control.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Role-Based Access", desc: "Employees see only their tickets. Staff see their department. Managers see everything. Admin controls it all.", icon: "lock" },
              { title: "Audit Log", desc: "Every action logged — who changed what and when. Full accountability trail on every ticket.", icon: "list" },
              { title: "SLA Enforcement", desc: "Response and resolution deadlines enforced automatically. Breach alerts before it's too late.", icon: "clock" },
              { title: "Secure by Design", desc: "Session auth, bcrypt passwords, rate limiting on all public endpoints. Built on Neon PostgreSQL.", icon: "shield" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-6">
                  {item.icon === "lock" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                  {item.icon === "list" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>}
                  {item.icon === "clock" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
                  {item.icon === "shield" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="reveal-section py-20 md:py-24 px-6 md:px-12 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">Frequently asked questions</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">Everything you need to know about the platform.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Who can use this platform?", a: "Any employee can submit IT or HR tickets. IT staff, HR staff, managers, and admins each have role-specific dashboards." },
              { q: "How are tickets assigned?", a: "Tickets are routed to the right department (IT or HR) automatically. Staff can also be assigned manually by managers." },
              { q: "What happens when a ticket is created?", a: "All active staff in the relevant department receive an in-app notification and email instantly." },
              { q: "How does the Knowledge Base work?", a: "Articles are created by admin or staff and visible to employees. Employees can search before raising a ticket." },
              { q: "Are SLAs enforced?", a: "Yes. Each ticket has response and resolution deadlines based on type and priority. Managers can see SLA compliance in their dashboard." },
              { q: "Is my data secure?", a: "All passwords are bcrypt-hashed. Sessions use NextAuth. Rate limiting protects all auth endpoints. Database is Neon PostgreSQL." }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center py-6 text-left"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{faq.q}</span>
                  <span className="text-slate-400 text-xl">{expandedFaq === idx ? '−' : '+'}</span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedFaq === idx ? 'opacity-100 pb-6' : 'opacity-0'
                  }`}
                  style={{ maxHeight: expandedFaq === idx ? '200px' : '0px' }}
                >
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Sign-In CTA */}
      <section className="reveal-section py-20 md:py-24 px-6 md:px-12 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-[#0a0f1e] border border-white/10 rounded-3xl p-16 text-center text-white">
            <h2 className="text-3xl font-extrabold mb-4">Already part of the team?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">Sign in to access your dashboard and tickets.</p>
            <Link href="/login" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 inline-flex items-center gap-2">
              Sign In <span>→</span>
            </Link>
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
  image: string | null;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"All" | "Technology" | "Business">("All");
  const [page, setPage] = useState(0);

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
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [filter]);

  const CARDS_PER_PAGE = 9;
  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const visible = filtered.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  return (
    <section className="reveal-section py-24 md:py-32 px-6 md:px-12 bg-[#0a0f1e] text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/10 pb-6">
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-orange-500 text-xs font-bold mb-2 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              LIVE
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Today&apos;s News</h2>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Technology & Business — Updated hourly
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["All", "Technology", "Business"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "border border-white/20 text-white/60 hover:bg-white/10"}`}
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
              <div key={i} className="bg-[#111827] rounded-2xl p-6 border border-white/10 animate-pulse">
                <div className="aspect-video bg-white/5 rounded-xl mb-4" />
                <div className="h-3 w-20 bg-white/10 rounded mb-3" />
                <div className="h-5 bg-white/10 rounded mb-2" />
                <div className="h-5 w-3/4 bg-white/10 rounded mb-4" />
                <div className="h-3 bg-white/5 rounded mb-1.5" />
                <div className="h-3 w-5/6 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 text-white/40 font-medium">No news available right now. Check back shortly.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#111827] rounded-2xl border border-white/8 hover:border-orange-400/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] transition-all flex flex-col overflow-hidden"
              >
                {item.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
                <div className={`p-6 flex flex-col flex-1 ${!item.image ? "border-l-4 " + (item.category === "Technology" ? "border-orange-500" : "border-blue-500") : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${item.category === "Technology" ? "bg-orange-500/15 text-orange-400 border border-orange-400/20" : "bg-blue-500/15 text-blue-400 border border-blue-400/20"}`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-white/30 font-medium">{timeAgo(item.pubDate)}</span>
                  </div>
                  <h3 className="font-bold text-white leading-snug mb-3 group-hover:text-orange-400 transition-colors line-clamp-2 text-base">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-white/50 leading-relaxed line-clamp-2 flex-1 mb-4">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                    <span className="text-xs font-bold text-white/40">{item.source}</span>
                    <span className="text-white/20 group-hover:text-orange-400 transition-colors">↗</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end mt-10 gap-4">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`border border-white/20 text-white/70 px-5 py-2 rounded-full hover:bg-white/10 transition-all text-sm font-medium ${page === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              ← Prev
            </button>
            <span className="text-white/50 text-sm font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className={`border border-white/20 text-white/70 px-5 py-2 rounded-full hover:bg-white/10 transition-all text-sm font-medium ${page === totalPages - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
