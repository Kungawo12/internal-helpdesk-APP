"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: "01",
    title: "Submit a Ticket",
    description:
      "Choose IT or HR, describe your issue, set the priority, and submit. It takes less than a minute.",
    icon: "✍️",
  },
  {
    step: "02",
    title: "Team Gets Notified",
    description:
      "The relevant department receives an instant email notification with your ticket details.",
    icon: "🔔",
  },
  {
    step: "03",
    title: "Issue Gets Resolved",
    description:
      "IT or HR staff reviews, works on your ticket, and posts a solution once it is resolved.",
    icon: "🔧",
  },
  {
    step: "04",
    title: "You Give Feedback",
    description:
      "Rate the resolution and leave feedback. Your input helps us improve the support experience.",
    icon: "💬",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hiw-heading", {
        scrollTrigger: { trigger: ".hiw-heading", start: "top 85%" },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".hiw-step", {
        scrollTrigger: { trigger: ".hiw-steps", start: "top 80%" },
        opacity: 0,
        x: -40,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-32 px-6"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <div className="hiw-heading text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple 4-Step Process
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            From issue to resolution — a streamlined workflow that keeps
            everyone in the loop.
          </p>
        </div>

        <div className="hiw-steps relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-emerald-500/50" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.step} className="hiw-step flex items-start gap-8">
                {/* Step number */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="text-xs font-mono text-slate-500 mt-1">
                      {step.step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-full h-12 w-px bg-white/10" />
                  )}
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed max-w-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
