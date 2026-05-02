"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });
      
      gsap.from(".hero-ui", {
        opacity: 0,
        y: 40,
        duration: 1.5,
        delay: 0.6,
        ease: "expo.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col items-center">
      <div className="absolute inset-0 grid-subtle pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <div className="hero-text inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">v2.0 Enterprise Release</span>
        </div>

        <h1 className="hero-text text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
          Internal operations, <br />
          <span className="text-primary">simplified for everyone.</span>
        </h1>

        <p className="hero-text text-lg md:text-xl text-subtle max-w-2xl mx-auto mb-12 leading-relaxed">
          The all-in-one helpdesk for modern companies. Manage IT requests, HR inquiries, 
          and team operations with speed and clarity.
        </p>

        <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/register" className="btn-primary px-10 py-4 text-base">
            Start using Helpdesk
          </Link>
          <Link href="#features" className="btn-secondary px-10 py-4 text-base">
            View Features
          </Link>
        </div>

        {/* Dashboard Preview - Minimal & Static */}
        <div className="hero-ui relative w-full max-w-5xl mx-auto rounded-2xl border border-white/10 bg-bg-card shadow-2xl overflow-hidden aspect-[16/10]">
          <div className="absolute inset-0 p-8 flex gap-6">
            {/* Mock UI */}
            <div className="w-64 h-full border-r border-white/5 flex flex-col gap-4 pr-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg w-full" />)}
            </div>
            <div className="flex-1 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-white/10 rounded w-48" />
                <div className="h-10 bg-primary/20 rounded-lg w-32" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
              </div>
              <div className="space-y-4 pt-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white/[0.02] border border-white/5 rounded-xl w-full" />)}
              </div>
            </div>
          </div>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
