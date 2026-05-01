"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", { opacity: 0, y: 20, duration: 0.6 })
        .from(".hero-title", { opacity: 0, y: 30, duration: 0.8 }, "-=0.3")
        .from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.6 }, "-=0.4")
        .from(".hero-buttons", { opacity: 0, y: 20, duration: 0.6 }, "-=0.3")
        .from(".hero-visual", { opacity: 0, scale: 0.9, duration: 1 }, "-=0.5");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center gradient-bg grid-pattern overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 flex flex-col lg:flex-row items-center gap-16">
        {/* Left - Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Internal Support Platform
          </div>

          <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Get Help,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Stay Productive
            </span>
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed">
            Submit IT and HR support tickets, track real-time status updates,
            and get solutions — all from a single unified dashboard.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              href="/login"
              className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] text-center"
            >
              Get Started
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 border border-white/10 hover:bg-white/5 rounded-xl font-semibold text-lg transition-all duration-300 text-center"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Right - Visual */}
        <div className="hero-visual flex-1 max-w-md w-full">
          <div className="relative">
            {/* Mock ticket card */}
            <div className="card-glow bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 animate-float">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                  High Priority
                </span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                  In Progress
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Unable to connect to VPN
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Getting timeout error when trying to connect to company VPN from
                remote location...
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                    JD
                  </div>
                  <span className="text-sm text-slate-400">John D.</span>
                </div>
                <span className="text-xs text-slate-500">2 hours ago</span>
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -top-4 -right-4 card-glow bg-emerald-500/10 backdrop-blur-xl rounded-xl p-3 border border-emerald-500/20 animate-float-delay">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-400 text-sm">&#10003;</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-400">
                    Ticket Resolved
                  </p>
                  <p className="text-xs text-slate-500">Just now</p>
                </div>
              </div>
            </div>

            {/* Floating stat */}
            <div className="absolute -bottom-4 -left-4 card-glow bg-purple-500/10 backdrop-blur-xl rounded-xl p-3 border border-purple-500/20 animate-float">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-purple-400 text-lg">&#9889;</span>
                </div>
                <div>
                  <p className="text-xs font-medium">Avg. Resolution</p>
                  <p className="text-sm font-bold text-purple-400">2.4 hrs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500">
        <span className="text-xs">Scroll to explore</span>
        <div className="w-5 h-8 border border-slate-600 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-slate-500 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
