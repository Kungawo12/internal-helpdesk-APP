"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Enterprise Helpdesk v1.0</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
          Support that moves as <br /> <span className="text-blue-500">fast as your team.</span>
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          The unified internal ticketing system for IT and HR operations. 
          Built for modern organizations who prioritize employee productivity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <Link href="/register" className="btn-primary px-10 py-4 text-base shadow-xl shadow-blue-500/10">
            Get Started
          </Link>
          <Link href="#features" className="btn-secondary px-10 py-4 text-base">
            Learn More
          </Link>
        </div>

        {/* Professional Mockup Area */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
          <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-500/20" />
            </div>
            <div className="aspect-[16/9] bg-[#020617] rounded-lg border border-white/5 flex items-center justify-center">
               <div className="text-slate-800 font-bold text-4xl uppercase tracking-[0.2em]">Dashboard Preview</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
