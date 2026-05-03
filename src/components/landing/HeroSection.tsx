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
        y: 40,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
      });
      
      gsap.from(".hero-ui", {
        opacity: 0,
        y: 60,
        duration: 1.8,
        delay: 0.8,
        ease: "expo.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative pt-40 pb-32 overflow-hidden min-h-screen flex flex-col items-center">
      {/* Background Image Layer */}
      <div className="app-bg" />
      <div className="app-overlay bg-black/40" />
      
      <div className="max-w-6xl mx-auto px-8 text-center relative z-10">
        <div className="hero-text inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-10 backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Enterprise Operations v1.0</span>
        </div>

        <h1 className="hero-text text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9] text-white text-glow">
          Service Excellence, <br />
          <span className="text-primary">Redefined.</span>
        </h1>

        <p className="hero-text text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-16 leading-relaxed font-bold tracking-tight">
          The high-performance IT & HR ticketing platform designed for 
          the modern enterprise. Streamlined, professional, and breathtakingly fast.
        </p>

        <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <Link href="/register" className="btn-primary px-14 py-5 text-lg font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(56,189,248,0.3)]">
            Initialize Access
          </Link>
          <Link href="#features" className="btn-secondary px-14 py-5 text-lg font-black uppercase tracking-widest bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-3xl">
            Explore Features
          </Link>
        </div>

        {/* Cinematic Dashboard Preview */}
        <div className="hero-ui relative w-full max-w-5xl mx-auto rounded-[40px] border border-white/10 glass-card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden aspect-[16/9] p-2 animate-float">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none z-10" />
           <div className="w-full h-full rounded-[32px] bg-bg-darker overflow-hidden relative">
              <img 
                src="/images/dashboard_preview.png" 
                alt="Helpdesk Dashboard Preview"
                className="w-full h-full object-cover"
              />
           </div>
        </div>
      </div>
    </section>
  );
}
