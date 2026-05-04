"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(".hero-elem", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
      });

      // Scroll animations for sections
      gsap.utils.toArray<HTMLElement>(".gsap-reveal").forEach((elem) => {
        gsap.from(elem, {
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      });
      
      gsap.utils.toArray<HTMLElement>(".gsap-stagger").forEach((elem) => {
        const children = elem.children;
        gsap.from(children, {
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
          },
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen text-[#475569] font-sans selection:bg-[#2563eb] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 navbar-glass px-8 md:px-16 flex items-center transition-all duration-300">
        <div className="w-full max-w-[1200px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center font-bold text-white text-xl">
              H
            </div>
            <span className="font-bold text-xl tracking-tight text-[#0f172a]">Helpdesk</span>
          </Link>
          
          <div className="flex items-center gap-6 text-[15px] font-semibold">
            <Link href="/login" className="text-[#475569] hover:text-[#0f172a] transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary !py-2.5 !px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="bg-[#0f172a] text-white pt-40 pb-32 px-8 md:px-16 text-center">
          <div className="max-w-[1200px] mx-auto flex flex-col items-center pt-10">
            <h1 className="heading-hero mb-6 text-white hero-elem">
              Support that moves<br />at the speed of work
            </h1>
            <p className="text-lg md:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-12 hero-elem">
              Submit IT and HR support tickets, track their status, and get solutions instantly. A seamless experience for everyone.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 hero-elem">
              <Link href="/register" className="bg-white text-[#0f172a] px-8 py-3 rounded-xl font-semibold text-[15px] hover:bg-gray-100 transition-colors shadow-lg">
                Get Started
              </Link>
              <Link href="/login" className="bg-transparent border border-white/20 text-white px-8 py-3 rounded-xl font-semibold text-[15px] hover:bg-white/10 transition-colors">
                Sign In
              </Link>
            </div>

            {/* Dashboard Mockup */}
            <div className="mt-24 w-full max-w-4xl mx-auto hero-elem relative">
              <div className="aspect-[16/9] bg-[#f8fafc] rounded-t-2xl shadow-2xl border-t border-x border-white/10 overflow-hidden flex flex-col">
                {/* Mockup Header */}
                <div className="h-12 border-b border-[#e2e8f0] flex items-center px-4 gap-2 bg-white">
                   <div className="w-3 h-3 rounded-full bg-[#e2e8f0]" />
                   <div className="w-3 h-3 rounded-full bg-[#e2e8f0]" />
                   <div className="w-3 h-3 rounded-full bg-[#e2e8f0]" />
                </div>
                {/* Mockup Body */}
                <div className="flex-1 p-8 flex gap-6 bg-[#f8fafc]">
                  <div className="w-1/4 flex flex-col gap-4">
                    <div className="h-8 bg-white rounded-lg border border-[#e2e8f0] w-full" />
                    <div className="h-8 bg-white rounded-lg border border-[#e2e8f0] w-5/6" />
                    <div className="h-8 bg-white rounded-lg border border-[#e2e8f0] w-4/5" />
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="h-32 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
                       <div className="h-4 bg-[#e2e8f0] rounded w-1/3 mb-4" />
                       <div className="h-3 bg-[#f1f5f9] rounded w-full mb-2" />
                       <div className="h-3 bg-[#f1f5f9] rounded w-5/6" />
                    </div>
                    <div className="h-32 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
                       <div className="h-4 bg-[#e2e8f0] rounded w-1/4 mb-4" />
                       <div className="h-3 bg-[#f1f5f9] rounded w-full mb-2" />
                       <div className="h-3 bg-[#f1f5f9] rounded w-4/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-32 px-8 md:px-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20 gsap-reveal">
              <h2 className="heading-section mb-4 text-[#0f172a]">Everything your team needs</h2>
              <p className="text-lg text-[#64748b]">Powerful features disguised as a simple interface.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gsap-stagger">
              {[
                { icon: "⚡", title: "Quick Ticketing", desc: "Submit detailed requests in seconds with intuitive forms." },
                { icon: "🎯", title: "Real-Time Tracking", desc: "Never wonder about the status of your issue again." },
                { icon: "✉️", title: "Email Alerts", desc: "Get notified instantly when your ticket is updated." },
                { icon: "🔐", title: "Role-Based Access", desc: "Distinct, focused views for employees, staff, and managers." },
                { icon: "📚", title: "Solution Database", desc: "Access historical resolutions to solve recurring problems." },
                { icon: "⭐", title: "Feedback System", desc: "Rate the support you received to help us improve." },
              ].map((f, i) => (
                <div key={i} className="card">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">{f.title}</h3>
                  <p className="text-[#475569]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-[#f8fafc] py-32 px-8 md:px-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20 gsap-reveal">
              <h2 className="heading-section mb-4 text-[#0f172a]">How it works</h2>
              <p className="text-lg text-[#64748b]">A simple, transparent process from start to finish.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 gsap-stagger">
              {[
                { num: "01", title: "Submit", desc: "Create a ticket for IT or HR support." },
                { num: "02", title: "Notify", desc: "The right team is alerted instantly." },
                { num: "03", title: "Resolve", desc: "Staff work on and resolve your issue." },
                { num: "04", title: "Feedback", desc: "Rate the solution provided." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-start">
                  <div className="text-5xl font-extrabold text-[#e2e8f0] mb-4">{step.num}</div>
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">{step.title}</h3>
                  <p className="text-[#475569]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="bg-white py-32 px-8 md:px-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20 gsap-reveal">
              <h2 className="heading-section mb-4 text-[#0f172a]">Built for everyone</h2>
              <p className="text-lg text-[#64748b]">Tailored experiences for every role in the company.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 gsap-stagger">
              <div className="card">
                <h3 className="text-xl font-bold text-[#0f172a] mb-4">Employees</h3>
                <ul className="space-y-3 text-[#475569]">
                  <li className="flex gap-2"><span>✓</span> Submit IT and HR tickets</li>
                  <li className="flex gap-2"><span>✓</span> Track resolution status</li>
                  <li className="flex gap-2"><span>✓</span> Provide satisfaction ratings</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="text-xl font-bold text-[#0f172a] mb-4">Support Staff</h3>
                <ul className="space-y-3 text-[#475569]">
                  <li className="flex gap-2"><span>✓</span> Dedicated departmental queues</li>
                  <li className="flex gap-2"><span>✓</span> Claim and resolve tickets</li>
                  <li className="flex gap-2"><span>✓</span> Document solutions</li>
                </ul>
              </div>
              <div className="card border-t-4 border-[#2563eb]">
                <h3 className="text-xl font-bold text-[#0f172a] mb-4">Managers</h3>
                <ul className="space-y-3 text-[#475569]">
                  <li className="flex gap-2"><span>✓</span> High-level KPI dashboards</li>
                  <li className="flex gap-2"><span>✓</span> Monitor department performance</li>
                  <li className="flex gap-2"><span>✓</span> View all company tickets</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#0f172a] py-32 px-8 md:px-16 text-center text-white">
          <div className="max-w-[1200px] mx-auto gsap-reveal">
            <h2 className="heading-section mb-8 text-white">Ready to get started?</h2>
            <Link href="/register" className="bg-white text-[#0f172a] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors inline-block">
              Create an Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 px-8 text-center border-t border-[#e2e8f0]">
        <p className="text-[#94a3b8] text-sm">© 2026 Internal Support Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
