"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Hero word-by-word reveal matching Clay's LineByLine_Splitted_fadePosition__fy8PX
      gsap.fromTo(
        ".str-word",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power4.out",
          delay: 0.2
        }
      );

      // Section fades
      gsap.utils.toArray<HTMLElement>("section").forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 40 },
          {
            scrollTrigger: {
              trigger: sec,
              start: "top 80%",
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroText = "Helpdesk is a unified internal support and ticketing platform";

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050411] text-white font-sans overflow-hidden">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-8 text-white">
        <div className="font-bold tracking-tighter text-2xl pointer-events-auto">
          <Link href="/">HELPDESK®</Link>
        </div>
        <nav className="hidden md:flex gap-8 font-semibold tracking-tight text-lg pointer-events-auto">
          <Link href="/dashboard">Platform</Link>
          <Link href="/login">Sign In</Link>
          <Link href="/register" className="px-6 py-2 bg-white text-black rounded-full hover:scale-105 transition-transform">Start</Link>
        </nav>
      </header>

      <main className="Main_Main___hAS2 pt-32 md:pt-48 pb-24">
        
        {/* HomeHero_HomeHero__0ywvx */}
        <section className="px-6 md:px-12 mb-32 md:mb-64">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-[12vw] md:text-[8vw] font-bold leading-[0.9] tracking-tighter text-white">
              <span className="relative block">
                {heroText.split(" ").map((word, i) => (
                  <span key={i} className="inline-block relative mr-[2vw] md:mr-[1.5vw]">
                    <span className="str-word inline-block">{word}</span>
                  </span>
                ))}
              </span>
            </h1>
          </div>
        </section>

        <div className="bg-white text-black rounded-t-[40px] pt-12 md:pt-24">

        {/* CapabilitiesTop_CapabilitiesTop__NI0UP */}
        <section className="px-6 md:px-12 py-24 bg-white border-t border-black/10">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
            <div>
              <p className="text-[2rem] md:text-[3rem] font-medium leading-tight tracking-tight text-[#050411]">
                We resolve critical blockers for the world's leading teams by blending intelligent routing, automation, and design.
              </p>
            </div>
            
            <div className="space-y-2 border-t border-black/10">
              {['Hardware Support', 'Software Access', 'Security Operations', 'Infrastructure'].map((item, i) => (
                <div key={i} className="border-b border-black/10">
                  <button 
                    className="w-full py-8 flex justify-between items-center text-left"
                    onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                  >
                    <span className="text-3xl md:text-5xl font-semibold tracking-tight">{item}</span>
                    <svg width="24" height="24" viewBox="0 0 21 13" fill="none" className={`transform transition-transform duration-500 ${activeAccordion === i ? 'rotate-180' : ''}`}>
                      <path d="m1.467 1.732 9.018 8.852 8.684-8.524" stroke="currentColor" strokeWidth="2.5"></path>
                    </svg>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${activeAccordion === i ? 'max-h-[500px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                    <p className="text-xl text-black/60 max-w-lg">
                      Streamline your requests and eliminate bottlenecks. Our automated routing ensures your {item.toLowerCase()} tickets reach the right expert instantly.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LogoWall_Section_bright__i1pll */}
        <section className="py-24 overflow-hidden bg-[#f4f4f4]">
          <div className="flex w-[200%] logo-track">
            <div className="flex w-1/2 justify-around items-center">
              {['Engineering', 'Design', 'Finance', 'HR', 'Operations', 'Marketing'].map((dept, i) => (
                <span key={i} className="text-4xl md:text-6xl font-bold text-black/20 tracking-tighter uppercase px-8">{dept}</span>
              ))}
            </div>
            <div className="flex w-1/2 justify-around items-center">
              {['Engineering', 'Design', 'Finance', 'HR', 'Operations', 'Marketing'].map((dept, i) => (
                <span key={`dup-${i}`} className="text-4xl md:text-6xl font-bold text-black/20 tracking-tighter uppercase px-8">{dept}</span>
              ))}
            </div>
          </div>
        </section>

        {/* WorkHome_Section__7d4QS */}
        <section className="px-6 md:px-12 py-32 bg-white">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="text-[3rem] font-medium tracking-tight mb-16">Core Modules</h2>
            
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-24">
              
              {/* Item 1 - Small Wrapper */}
              <li className="col-span-1 md:col-span-1 md:pr-12">
                <Link href="/dashboard" className="block group cursor-pointer">
                  <article>
                    <div className="aspect-square bg-[#f4f4f4] rounded-[40px] mb-8 overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                         <div className="text-8xl font-black text-black/5 tracking-tighter">01</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold tracking-tight mb-4">Enterprise Dashboard</h3>
                      <p className="text-xl text-black/60 mb-6">Real-time visibility into organization-wide analytics.</p>
                      <ul className="flex flex-wrap gap-3 mb-8">
                        <li className="px-4 py-2 border border-black/10 rounded-full text-sm font-semibold tracking-tight">Manager</li>
                        <li className="px-4 py-2 border border-black/10 rounded-full text-sm font-semibold tracking-tight">Staff</li>
                      </ul>
                      <div className="flex items-center gap-2 font-semibold text-lg border-b border-black/20 pb-1 w-fit group-hover:border-black transition-colors">
                        <span>View platform</span>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.6075 11.8572L13.255 8.40897L14.1388 7.5L19 12.5L14.1388 17.5L13.255 16.591L16.6075 13.1428H5V11.8572H16.6075Z"></path></svg>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>

              {/* Item 2 - Large Wrapper */}
              <li className="col-span-1 md:col-span-1 md:pt-32">
                <Link href="/dashboard/create" className="block group cursor-pointer">
                  <article>
                    <div className="aspect-[4/5] bg-[#000000] rounded-[40px] mb-8 overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-t from-black to-slate-900 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                         <div className="text-8xl font-black text-white/5 tracking-tighter">02</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold tracking-tight mb-4">Frictionless Submission</h3>
                      <p className="text-xl text-black/60 mb-6">One simple form, instantly routed to the right expert.</p>
                      <ul className="flex flex-wrap gap-3 mb-8">
                        <li className="px-4 py-2 border border-black/10 rounded-full text-sm font-semibold tracking-tight">Employee</li>
                        <li className="px-4 py-2 border border-black/10 rounded-full text-sm font-semibold tracking-tight">UX</li>
                      </ul>
                      <div className="flex items-center gap-2 font-semibold text-lg border-b border-black/20 pb-1 w-fit group-hover:border-black transition-colors">
                        <span>Create ticket</span>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.6075 11.8572L13.255 8.40897L14.1388 7.5L19 12.5L14.1388 17.5L13.255 16.591L16.6075 13.1428H5V11.8572H16.6075Z"></path></svg>
                      </div>
                    </div>
                  </article>
                </Link>
              </li>

            </ul>
          </div>
        </section>
        </div>

      </main>
      
      {/* Footer */}
      <footer className="bg-black text-white px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-16">
          <div className="w-full md:w-1/2">
             <h2 className="text-[10vw] md:text-[6vw] font-black leading-none tracking-tighter mb-8">HELPDESK®</h2>
             <div className="flex gap-4">
               <Link href="/register" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform">Start Trial</Link>
               <Link href="/login" className="px-8 py-4 border-2 border-white/20 rounded-full font-bold text-lg hover:border-white transition-colors">Sign In</Link>
             </div>
          </div>
          <div className="w-full md:w-auto text-left md:text-right text-white/60 font-medium text-lg">
             <p>© 2026 Internal Support Platform</p>
             <p>Designed for frictionless operations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
