"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-badge", { opacity: 0, y: 20, duration: 1 })
        .from(".hero-title", { opacity: 0, y: 40, duration: 1.2, skewY: 2 }, "-=0.8")
        .from(".hero-subtitle", { opacity: 0, y: 20, duration: 1 }, "-=1")
        .from(".hero-buttons", { opacity: 0, y: 20, duration: 1 }, "-=0.8")
        .from(".hero-visual", { opacity: 0, scale: 0.8, rotate: -5, duration: 1.5 }, "-=1");

      // Floating animation for blobs
      gsap.to(".blob-1", {
        x: "30vw",
        y: "20vh",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".blob-2", {
        x: "-20vw",
        y: "-10vh",
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Elements */}
      <div className="mesh-gradient" />
      <div className="noise" />
      <div className="absolute inset-0 grid-pattern opacity-50" />
      
      {/* Animated Blobs */}
      <div className="blob-1 glow-blob w-[500px] h-[500px] bg-blue-600/20 top-[-10%] left-[-10%]" />
      <div className="blob-2 glow-blob w-[400px] h-[400px] bg-purple-600/20 bottom-[-10%] right-[-10%]" />
      <div className="blob-3 glow-blob w-[300px] h-[300px] bg-cyan-600/20 top-[40%] right-[20%]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-20">
        {/* Left Content */}
        <div className="flex-1 text-center lg:text-left">
          <div className="hero-badge inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-white/10 text-blue-400 text-sm font-medium mb-10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Next-Gen Internal Support
          </div>

          <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1] mb-8">
            Empower Your 
            <br />
            <span className="text-gradient">
              Workforce
            </span>
          </h1>

          <p className="hero-subtitle text-xl text-slate-400 max-w-xl mb-12 leading-relaxed">
            A seamless, high-performance ticketing platform designed to keep your team moving. IT and HR support, refined for the modern age.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <a
              href="/login"
              className="group relative px-10 py-5 bg-primary rounded-2xl font-bold text-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Launch Portal
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </a>
            <a
              href="#how-it-works"
              className="px-10 py-5 glass hover:bg-white/10 rounded-2xl font-bold text-lg transition-all duration-300"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Right Visual */}
        <div className="hero-visual flex-1 relative perspective-[1000px]">
          <div className="relative transform-gpu rotate-y-[-10deg] rotate-x-[10deg]">
            {/* Main Mock Card */}
            <div className="glass p-8 rounded-[32px] border-white/10 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <span className="px-4 py-1.5 glass border-white/5 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  Live Dashboard
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="h-4 w-1/3 bg-white/5 rounded-full animate-shimmer" />
                <div className="h-32 w-full bg-white/5 rounded-2xl animate-shimmer" />
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                    <div className="space-y-2">
                      <div className="h-3 w-20 bg-white/10 rounded-full" />
                      <div className="h-2 w-12 bg-white/5 rounded-full" />
                    </div>
                  </div>
                  <div className="h-8 w-24 glass rounded-lg" />
                </div>
              </div>
            </div>

            {/* Floating Accents */}
            <div className="absolute -top-10 -right-10 w-48 h-48 glass rounded-3xl border-white/10 p-6 shadow-2xl animate-float-delay z-20 backdrop-blur-2xl">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-blue-400 text-2xl">🚀</span>
              </div>
              <p className="text-sm font-bold mb-1">Resolution Time</p>
              <p className="text-2xl font-black text-blue-400">-42%</p>
            </div>

            <div className="absolute -bottom-10 -left-10 w-56 h-32 glass rounded-3xl border-white/10 p-6 shadow-2xl animate-float z-0 backdrop-blur-2xl">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030712] bg-slate-800" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400">+12 Staff Online</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-50">
        <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Discover More</span>
      </div>
    </section>
  );
}
