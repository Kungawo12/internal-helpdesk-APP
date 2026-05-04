"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/landing/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Feature Grid */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to support your team</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">A unified platform for IT and HR support, designed for speed and reliability.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Unified Ticketing", desc: "Manage IT and HR requests in a single, high-performance interface.", icon: "🎫" },
                { title: "Rapid Resolution", desc: "Real-time updates and notifications keep your team moving fast.", icon: "⚡" },
                { title: "Executive Analytics", desc: "Gain deep insights into team performance with built-in reporting.", icon: "📊" },
                { title: "Secure Authentication", desc: "Enterprise-grade security ensuring your data remains protected.", icon: "🔒" },
                { title: "Mobile Ready", desc: "Support your team from anywhere with a fully responsive mobile experience.", icon: "📱" },
                { title: "Role-Based Access", desc: "Granular permissions for employees, staff, and management.", icon: "👥" },
              ].map((f, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-xl hover:bg-white/[0.05] transition-all">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tailored for every role</h2>
              <p className="text-slate-400">Customized experiences for every member of your organization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { role: "Employees", desc: "Submit tickets in seconds and track progress with real-time updates.", color: "text-blue-400" },
                { role: "IT & HR Staff", desc: "Manage queues efficiently with powerful triage and resolution tools.", color: "text-green-400" },
                { role: "Management", desc: "Monitor company-wide performance with high-level analytics and reporting.", color: "text-amber-400" },
              ].map((r, i) => (
                <div key={i} className="p-8 border border-white/10 rounded-xl bg-black/40">
                  <h3 className={`text-xl font-bold mb-3 ${r.color}`}>{r.role}</h3>
                  <p className="text-slate-400 text-sm">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to streamline your internal support?</h2>
            <p className="text-slate-400 text-lg">Join forward-thinking companies using our Helpdesk to power their operations.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="btn-primary px-10 py-4 text-base">
                Get Started Now
              </Link>
              <Link href="/login" className="btn-secondary px-10 py-4 text-base">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-slate-500 text-sm">© 2024 Helpdesk Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
