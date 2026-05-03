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
    <section ref={containerRef} className="relative pt-32 pb-24 overflow-hidden min-h-screen flex flex-col items-center">
      {/* Professional Landing Background */}
      <div 
        className="absolute inset-0 z-0 opacity-30 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: 'url("/images/landing_bg.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-bg-dark via-transparent to-bg-dark pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-8 text-center relative z-10">
        <div className="hero-text inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">Internal Support Platform</span>
        </div>

        <h1 className="hero-text text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-white">
          Get Help, <br />
          <span className="text-primary">Stay Productive.</span>
        </h1>

        <p className="hero-text text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Submit and track IT & HR tickets with ease. Our streamlined platform 
          ensures your requests are handled quickly and efficiently.
        </p>

        <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/register" className="btn-primary px-10 py-4 text-sm font-bold uppercase tracking-wider shadow-2xl shadow-primary/30">
            Get Started
          </Link>
          <Link href="#features" className="btn-secondary px-10 py-4 text-sm font-bold uppercase tracking-wider bg-white/5 border-white/10 hover:bg-white/10">
            Learn More
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-ui relative w-full max-w-5xl mx-auto rounded-[24px] border border-white/10 glass shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden aspect-[16/10] p-1">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none z-10" />
           <div className="w-full h-full rounded-[20px] bg-bg-darker overflow-hidden relative">
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
