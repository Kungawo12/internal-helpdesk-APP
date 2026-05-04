"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMagnetic } from "@/hooks/useMagnetic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef(null);
  const btnRef = useRef(null);
  const mockupRef = useRef(null);
  
  useMagnetic(btnRef);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Breathing Mesh
      gsap.to(".prism-mesh", {
        x: "10%",
        y: "5%",
        rotate: 5,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Hero Entrance
      gsap.from(".hero-content > *", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out",
        filter: "blur(10px)",
      });

      // Floating Mockup
      gsap.to(mockupRef.current, {
        y: -20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Feature Reveal
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".feature-grid",
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        scale: 0.95,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      <div className="prism-bg">
        <div className="prism-mesh" />
        <div 
          className="prism-wallpaper" 
          style={{ backgroundImage: 'url("/images/modern_it_workspace.png")' }} 
        />
      </div>
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center px-12">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-[#0f172a] rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-xl group-hover:rotate-12 transition-transform">
              H
            </div>
            <span className="font-bold text-3xl tracking-tighter text-[#0f172a]">Helpdesk</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-[#475569]">
            <Link href="#features" className="hover:text-[#0f172a] transition-colors">Features</Link>
            <Link href="/login" className="hover:text-[#0f172a] transition-colors">Sign In</Link>
            <div ref={btnRef}>
               <Link href="/register" className="btn-prism !py-3 !px-8">
                 Get Started
               </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-56 pb-32 px-6">
          <div className="max-w-6xl mx-auto text-center hero-content">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/50 backdrop-blur-xl border border-white text-blue-600 text-[11px] font-black uppercase tracking-widest mb-10 shadow-sm">
              <span className="status-pulse bg-blue-600" />
              Intelligence_System_Active
            </div>
            <h1 className="heading-hero mb-10">
              Internal support <br /> <span className="text-blue-600">reimagined for speed.</span>
            </h1>
            <p className="text-2xl text-[#475569] max-w-3xl mx-auto mb-16 leading-relaxed font-medium">
              Eliminate support friction with our unified Prism platform. 
              Built for teams who prioritize employee productivity and operational excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link href="/register" className="btn-prism px-12 py-6 text-xl shadow-2xl shadow-blue-500/20">
                Start Resolving Now
              </Link>
              <Link href="/login" className="flex items-center gap-3 text-sm font-black text-[#0f172a] group">
                Access your manifest <span className="group-hover:translate-x-2 transition-transform">→</span>
              </Link>
            </div>

            {/* Premium Floating Mockup */}
            <div ref={mockupRef} className="mt-32 relative max-w-6xl mx-auto">
               <div className="absolute inset-0 bg-blue-600/5 blur-[150px] rounded-full" />
               <div className="relative glass-panel p-3 border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
                  <div className="bg-white rounded-[14px] overflow-hidden border border-slate-200 aspect-[16/10] flex flex-col shadow-inner">
                     <div className="h-12 bg-slate-50 border-b border-slate-200 flex items-center px-6 gap-3">
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                     </div>
                     <div className="flex-1 p-10 grid grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm" />)}
                        <div className="col-span-4 h-full bg-slate-50 rounded-2xl border border-slate-100 mt-6" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Bento Feature Grid */}
        <section id="features" className="py-40 px-6 bg-slate-50/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-28">
              <h2 className="heading-section text-5xl mb-6">World-class infrastructure</h2>
              <p className="text-[#475569] text-lg max-w-2xl mx-auto font-medium">A state-of-the-art workspace designed to eliminate support bottlenecks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 feature-grid">
               {[
                 { title: "Unified Prism Inbox", desc: "A single, high-performance view for all company-wide support tickets.", icon: "💎", size: "md:col-span-2" },
                 { title: "Real-time Metrics", desc: "Monitor resolution health and team performance live.", icon: "📊", size: "md:col-span-1" },
                 { title: "Dynamic Routing", desc: "Automated triage that connects users with the right specialist.", icon: "⚡", size: "md:col-span-1" },
                 { title: "Executive Analytics", desc: "High-level oversight for managers and decision makers.", icon: "🏢", size: "md:col-span-2" },
               ].map((f, i) => (
                 <div key={i} className={`feature-card glass-panel p-10 group ${f.size}`}>
                    <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                    <h3 className="text-2xl font-extrabold text-[#0f172a] mb-4 tracking-tight">{f.title}</h3>
                    <p className="text-[#475569] font-medium leading-relaxed">{f.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-slate-100 text-center relative">
         <div className="max-w-3xl mx-auto px-6">
            <h3 className="text-xl font-bold text-[#0f172a] mb-8">Ready to elevate your operations?</h3>
            <Link href="/register" className="btn-prism !px-12 !py-4">Get Started for Free</Link>
            <p className="mt-12 text-sm text-[#94a3b8] font-medium">© 2024 Helpdesk Platform. Experience the next stage of support.</p>
         </div>
      </footer>
    </div>
  );
}
