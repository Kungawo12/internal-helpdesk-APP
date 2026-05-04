"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#000000] font-sans selection:bg-[#000000] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 navbar-glass px-8 md:px-16 flex items-center transition-all duration-300">
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-[#000000] rounded-full flex items-center justify-center font-bold text-white text-xl transition-transform duration-500 group-hover:scale-90">
              H
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#000000]">Helpdesk</span>
          </Link>
          
          <div className="flex items-center gap-6 text-base font-semibold">
            <Link href="/login" className="text-[#6e6e73] hover:text-[#000000] transition-colors">Sign In</Link>
            <Link href="/register" className="btn-primary !py-3 !px-6 !text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-32">
        {/* Hero Section */}
        <section className="px-8 md:px-16 text-center max-w-[1400px] mx-auto min-h-[70vh] flex flex-col justify-center">
          <div className="clay-animate-up">
            <h1 className="heading-hero mb-8">
              Beautiful support.<br />
              <span className="text-[#6e6e73]">Brilliant workflow.</span>
            </h1>
          </div>
          <div className="clay-animate-up delay-100">
            <p className="text-xl md:text-3xl text-[#6e6e73] max-w-4xl mx-auto mb-16 leading-tight font-medium tracking-tight">
              An enterprise ticketing experience designed with the elegance of a creative agency and the power of a modern SaaS.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 clay-animate-up delay-200">
            <Link href="/register" className="btn-primary">
              Experience Now
            </Link>
            <Link href="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>

          {/* Abstract Hero Image/Mockup */}
          <div className="mt-32 w-full max-w-5xl mx-auto clay-animate-up delay-300">
             <div className="aspect-[16/10] bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden flex flex-col relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative z-10 h-16 border-b border-black/5 flex items-center px-8 gap-3 bg-white/50 backdrop-blur-xl">
                   <div className="w-3 h-3 rounded-full bg-black/20" />
                   <div className="w-3 h-3 rounded-full bg-black/20" />
                   <div className="w-3 h-3 rounded-full bg-black/20" />
                </div>
                <div className="relative z-10 flex-1 p-12 flex gap-8">
                   <div className="w-1/3 flex flex-col gap-6">
                      <div className="h-12 bg-black/5 rounded-2xl w-3/4" />
                      <div className="h-8 bg-black/5 rounded-xl w-full" />
                      <div className="h-8 bg-black/5 rounded-xl w-5/6" />
                      <div className="h-8 bg-black/5 rounded-xl w-4/5" />
                   </div>
                   <div className="flex-1 bg-white rounded-[32px] shadow-2xl border border-black/5 p-8 flex flex-col gap-6 transform group-hover:-translate-y-4 transition-transform duration-700 ease-out">
                      <div className="h-16 bg-black/5 rounded-2xl w-1/2" />
                      <div className="h-40 bg-black/5 rounded-2xl w-full" />
                      <div className="flex-1 bg-black/5 rounded-2xl w-full" />
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* Dynamic Asymmetric Grid Features */}
        <section id="features" className="py-40 px-8 md:px-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-24">
              <h2 className="heading-section mb-6 clay-animate-up">Simplicity is the<br/>ultimate sophistication.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[400px]">
               {/* Large Card */}
               <div className="md:col-span-8 card p-12 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10">
                     <h3 className="text-4xl font-bold mb-4 tracking-tight">Fluid Ticketing</h3>
                     <p className="text-xl text-[#6e6e73] font-medium max-w-md">Submit, track, and resolve issues without friction. Designed for pure productivity.</p>
                  </div>
                  <div className="relative z-10 w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                     +
                  </div>
               </div>

               {/* Tall Card */}
               <div className="md:col-span-4 card p-12 bg-[#000000] text-white flex flex-col justify-between group">
                  <div>
                     <h3 className="text-4xl font-bold mb-4 tracking-tight">Real-time</h3>
                     <p className="text-xl text-white/70 font-medium">Instant updates. Zero latency.</p>
                  </div>
                  <div className="text-6xl group-hover:-translate-y-4 transition-transform duration-500">⚡</div>
               </div>

               {/* Medium Card */}
               <div className="md:col-span-6 card p-12 flex flex-col justify-between group relative overflow-hidden">
                  <div className="relative z-10">
                     <h3 className="text-4xl font-bold mb-4 tracking-tight">Role-Based</h3>
                     <p className="text-xl text-[#6e6e73] font-medium">Distinct views for Employees, Managers, and Staff.</p>
                  </div>
                  <div className="relative z-10 text-6xl group-hover:scale-110 transition-transform duration-500 origin-bottom-right text-right">
                     🔐
                  </div>
               </div>

               {/* Medium Card 2 */}
               <div className="md:col-span-6 card p-12 flex flex-col justify-between group">
                  <div>
                     <h3 className="text-4xl font-bold mb-4 tracking-tight">Analytics</h3>
                     <p className="text-xl text-[#6e6e73] font-medium">Executive-level insights into department performance.</p>
                  </div>
                  <div className="text-6xl group-hover:rotate-12 transition-transform duration-500">📊</div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 px-8 md:px-16 bg-white border-t border-black/5 text-center">
         <div className="max-w-4xl mx-auto">
            <h2 className="heading-section mb-12">Elevate your workspace.</h2>
            <Link href="/register" className="btn-primary !px-12 !py-5 !text-lg mb-20">
               Start Free Trial
            </Link>
            <p className="text-base text-[#6e6e73] font-medium">© 2026 Premium Helpdesk. Inspired by clay.global.</p>
         </div>
      </footer>
    </div>
  );
}
