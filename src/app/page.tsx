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
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const ctx = gsap.context(() => {
      // Hero text reveal
      gsap.from(".hero-line", {
        y: "120%",
        opacity: 0,
        rotationZ: 2,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
      });

      // Scroll-triggered image reveals
      gsap.utils.toArray<HTMLElement>(".reveal-wrapper").forEach((wrapper) => {
        gsap.to(wrapper, {
          scrollTrigger: {
            trigger: wrapper,
            start: "top 80%",
            toggleClass: "is-revealed",
            once: true
          },
          clipPath: "inset(0 0 0 0)",
          duration: 1.5,
          ease: "power4.inOut"
        });
      });

      // Parallax text
      gsap.to(".parallax-text", {
        scrollTrigger: {
          trigger: ".parallax-section",
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        },
        y: -150
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-black font-sans overflow-hidden">
      
      {/* Custom Cursor */}
      <div 
        className={`custom-cursor hidden md:block ${isHovering ? 'hovering' : ''}`}
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-8 mix-blend-difference text-white pointer-events-none">
        <div className="font-bold tracking-tighter text-2xl pointer-events-auto">
          <Link href="/">HELPDESK®</Link>
        </div>
        <div className="flex gap-8 font-semibold tracking-tight text-lg pointer-events-auto">
          <Link href="/login" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Sign In</Link>
          <Link href="/register" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Start</Link>
        </div>
      </nav>

      <main>
        {/* Massive Hero Section */}
        <section className="h-screen flex flex-col justify-end px-4 md:px-8 pb-16 md:pb-24">
          <div className="overflow-hidden">
            <h1 className="clay-massive-heading hero-line tracking-tighter">DIGITAL</h1>
          </div>
          <div className="overflow-hidden flex items-center gap-4 md:gap-12">
            <h1 className="clay-massive-heading hero-line tracking-tighter">SUPPORT</h1>
            <div className="hidden md:block flex-1 h-[2px] bg-black hero-line mt-4" />
            <p className="hidden lg:block max-w-xs text-xl font-medium tracking-tight hero-line leading-tight">
              An internal service platform designed like a premium agency experience. No friction, pure aesthetics.
            </p>
          </div>
        </section>

        {/* Abstract Video/Image Showcase (Case Study Style) */}
        <section className="px-4 md:px-8 py-16">
          <div 
            className="reveal-wrapper w-full aspect-[4/5] md:aspect-[21/9] bg-[#f4f4f4] rounded-[40px] overflow-hidden relative cursor-pointer"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="reveal-image absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center">
              {/* Abstract Mockup inside the frame */}
              <div className="w-3/4 h-3/4 bg-white rounded-[32px] shadow-2xl rotate-[-2deg] transition-transform duration-700 hover:rotate-0 flex flex-col overflow-hidden border border-black/5">
                 <div className="h-16 border-b border-black/5 bg-[#fcfcfc] flex items-center px-8 gap-3">
                    <div className="w-3 h-3 rounded-full bg-black/20" />
                    <div className="w-3 h-3 rounded-full bg-black/20" />
                 </div>
                 <div className="p-12 flex-1">
                    <div className="h-12 bg-black w-3/4 mb-8" />
                    <div className="h-4 bg-black/10 w-full mb-4" />
                    <div className="h-4 bg-black/10 w-5/6 mb-4" />
                    <div className="h-4 bg-black/10 w-4/5" />
                 </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-8 mix-blend-difference text-white">
              <p className="text-2xl font-bold tracking-tight">Fluid Workflow System</p>
              <p className="text-lg font-medium opacity-80">Enterprise Dashboard</p>
            </div>
          </div>
        </section>

        {/* Massive Typography Divider / Parallax */}
        <section className="py-40 overflow-hidden parallax-section bg-black text-white px-4 md:px-8 my-32">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[8vw] font-black leading-none tracking-tighter parallax-text whitespace-nowrap">
              NOT ANOTHER
            </h2>
            <h2 className="text-[8vw] font-black leading-none tracking-tighter parallax-text whitespace-nowrap text-white/50">
              BORING TICKETING
            </h2>
            <h2 className="text-[8vw] font-black leading-none tracking-tighter parallax-text whitespace-nowrap">
              PLATFORM.
            </h2>
          </div>
        </section>

        {/* Asymmetric Grid (Replacing traditional Features) */}
        <section className="px-4 md:px-8 py-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 flex flex-col justify-between p-8">
              <h2 className="clay-sub-heading mb-8">Elevating internal communication.</h2>
              <p className="text-2xl font-medium tracking-tight text-[#666666]">
                Every pixel considered. We removed the visual clutter to focus on what matters: resolving your issues fast.
              </p>
            </div>
            
            <div className="md:col-span-7 space-y-8">
              <div className="card-clay aspect-square md:aspect-[4/3] bg-[#f4f4f4] flex flex-col justify-end" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <div className="text-[120px] font-black tracking-tighter mb-auto">01</div>
                <h3 className="text-4xl font-bold tracking-tight mb-4">Frictionless Submission</h3>
                <p className="text-xl font-medium text-[#666666]">One simple form. Instantly routed to the right expert.</p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-8 mt-0 md:mt-[-100px]">
              <div className="card-clay aspect-square md:aspect-[16/10] bg-black text-white flex flex-col justify-end" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <div className="text-[120px] font-black tracking-tighter mb-auto text-white/20">02</div>
                <h3 className="text-4xl font-bold tracking-tight mb-4 text-white">Real-time Visibility</h3>
                <p className="text-xl font-medium text-white/70">Watch your request move from open to resolved without refreshing.</p>
              </div>
            </div>
            
            <div className="md:col-span-4 flex flex-col justify-end pb-8">
              <Link href="/register" className="text-4xl font-bold tracking-tight hover:underline" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                Experience it now →
              </Link>
            </div>
          </div>
        </section>

        {/* Minimalist Footer */}
        <footer className="px-4 md:px-8 py-16 flex flex-col md:flex-row justify-between items-end border-t border-black/10">
          <div>
            <h1 className="text-[6vw] font-black tracking-tighter leading-none mb-8">HELPDESK®</h1>
            <div className="flex gap-4">
              <Link href="/register" className="btn-primary" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Start Trial</Link>
              <Link href="/login" className="btn-secondary" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>Sign In</Link>
            </div>
          </div>
          <div className="text-right mt-12 md:mt-0 font-medium">
            <p className="text-xl">© 2026</p>
            <p className="text-xl text-[#666666]">Internal Platform</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
