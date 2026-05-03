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
    <section ref={containerRef} className="relative pt-40 pb-24 overflow-hidden min-h-screen flex flex-col items-center">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full grid-subtle pointer-events-none -z-10" />
      
      <div className="max-w-6xl mx-auto px-8 text-center relative z-10">
        <div className="hero-text inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-10">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">v1.0 Production Release</span>
        </div>

        <h1 className="hero-text text-6xl md:text-8xl font-bold tracking-tighter mb-10 leading-[1.1] text-white">
          Get Help, <br />
          <span className="text-primary">Stay Productive.</span>
        </h1>

        <p className="hero-text text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
          The modern helpdesk for your entire team. Manage IT requests, 
          HR questions, and office operations with ease and clarity.
        </p>

        <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <Link href="/register" className="btn-primary px-12 py-5 text-lg font-bold uppercase tracking-wider shadow-2xl shadow-primary/40">
            Get Started
          </Link>
          <Link href="#features" className="btn-secondary px-12 py-5 text-lg font-bold uppercase tracking-wider bg-white/5 border-white/10 hover:bg-white/10">
            Learn More
          </Link>
        </div>

        {/* Tactical UI Preview */}
        <div className="hero-ui relative w-full max-w-6xl mx-auto rounded-[32px] border border-white/10 glass shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden aspect-[16/10] p-1 lg:p-2">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none z-10" />
           <div className="w-full h-full rounded-[24px] bg-bg-darker overflow-hidden relative">
              <img 
                src="/Users/tenzinjangchuk/.gemini/antigravity/brain/359db59e-b615-4d8f-85b4-c248e68de376/premium_it_dashboard_preview_1777735489799.png" 
                alt="Premium Helpdesk Dashboard Preview"
                className="w-full h-full object-cover"
              />
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
           </div>
        </div>
      </div>
    </section>
  );
}
