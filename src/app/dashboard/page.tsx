"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import gsap from "gsap";

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from(".data-pane", {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark overflow-hidden">
        <div className="scanlines" />
        <div className="w-64 loading-bar mb-6" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Synchronizing_Neural_Nodes</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen pb-40">
      <div className="hud-bg" />
      <div className="scanlines" />
      
      {/* HUD Header Branding */}
      <div className="mb-20 pt-10">
        <div className="inline-block hud-frame px-6 py-2 border-primary/20 transform skew-x-[-12deg] mb-6">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white transform skew-x-[12deg]">
            Mission_<span className="text-primary">Control</span>
          </h1>
        </div>
        <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Operator: {session?.user?.name} | Security_Level: ALPHA_7</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Central Intelligence Console */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="data-pane hud-frame p-1 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-50 pointer-events-none" />
            <div className="bg-hud-bg/20 p-8 backdrop-blur-3xl">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Operational_Queue</h2>
                    <p className="text-[9px] font-mono text-slate-500">REALTIME_INPUT_STREAM_V4.2</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Live_Feed</span>
                  </div>
               </div>

               <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="group/item relative">
                       <div className="hud-frame p-6 hover:bg-primary/10 transition-all duration-300 flex items-center justify-between cursor-pointer border-white/5 hover:border-primary/40 scan-effect">
                          <div className="flex items-center gap-6">
                             <div className={`w-3 h-3 rounded-none transform rotate-45 border ${
                               ticket.priority === 'urgent' ? 'bg-accent border-accent shadow-[0_0_15px_rgba(255,0,85,0.4)]' :
                               ticket.priority === 'high' ? 'bg-primary border-primary' : 'bg-transparent border-white/20'
                             }`} />
                             <div>
                               <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">NODE_{ticket.id.slice(0, 8)}</p>
                               <h3 className="text-lg font-black italic uppercase tracking-tight text-white group-hover/item:text-primary transition-colors">{ticket.title}</h3>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-10">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-xs font-black uppercase tracking-widest text-primary italic">{ticket.status}</p>
                             </div>
                             <div className="text-right hidden md:block">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Timestamp</p>
                                <p className="text-xs font-mono text-slate-400">{new Date(ticket.createdAt).toLocaleTimeString()}</p>
                             </div>
                             <button className="w-10 h-10 hud-frame flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all">
                                →
                             </button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {/* Tactical Overview Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="data-pane hud-frame p-6 bg-hud-bg/10 backdrop-blur-3xl relative overflow-hidden group">
              <div className="scan-effect absolute inset-0 pointer-events-none opacity-20" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-8">Tactical_Metrics</h2>
              
              <div className="space-y-10">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                       <span className="text-slate-500">Neural_Load</span>
                       <span className="text-primary">82%</span>
                    </div>
                    <div className="h-1 bg-white/5 relative overflow-hidden">
                       <div className="absolute top-0 left-0 h-full bg-primary w-[82%] node-glow" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="hud-frame p-4 bg-white/5 border-white/5">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Sync_Rate</p>
                       <p className="text-2xl font-black italic text-white">94.8%</p>
                    </div>
                    <div className="hud-frame p-4 bg-white/5 border-white/5">
                       <p className="text-[8px] font-black text-slate-500 uppercase mb-2">Uptime</p>
                       <p className="text-2xl font-black italic text-white">99.9h</p>
                    </div>
                 </div>

                 <div className="hud-frame p-6 border-primary/20 bg-primary/5">
                    <p className="text-[10px] font-black text-primary uppercase mb-4">Core_Protocol_X</p>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          <p className="text-[9px] font-mono text-slate-400">DATA_ENCRYPTION: ACTIVE</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          <p className="text-[9px] font-mono text-slate-400">NEURAL_ROUTING: OPTIMIZED</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Direct Protocol Terminal */}
           <div className="data-pane hud-frame p-4 bg-black/40 border-primary/10">
              <div className="flex items-center gap-3 mb-4 text-primary">
                 <span className="text-xs">⌨</span>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Command_Terminal</p>
              </div>
              <div className="bg-black/60 p-4 rounded border border-white/5 font-mono text-[10px] text-primary/80 leading-relaxed">
                 <p>{'>'} initialize --core-sync</p>
                 <p className="text-slate-600 italic">Core synchronized in 12ms</p>
                 <p>{'>'} fetch --all-nodes</p>
                 <p className="text-emerald-500/60">Success: 24 nodes online</p>
                 <div className="flex items-center gap-1 mt-2">
                    <p>{'>'}</p>
                    <div className="w-2 h-4 bg-primary animate-pulse" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Floating Action HUD */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[2000]">
         <div className="hud-frame p-3 border-primary/40 backdrop-blur-2xl bg-primary/10 flex items-center gap-4">
            <button className="px-8 py-3 bg-primary text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
               Initialize_New_Thread
            </button>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex gap-2">
               {['⎋', '⌥', '⌘'].map(key => (
                 <button key={key} className="w-10 h-10 hud-frame flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
                    {key}
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
