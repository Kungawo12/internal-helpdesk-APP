"use client";

import { useState } from "react";

interface Character {
  name: string;
  role: string;
  dept: string;
  seed: string;
  bgColor: string;
  detailTitle: string;
  bullets: string[];
  tags: string[];
}

const CHARACTERS: Character[] = [
  { 
    name: "Alex Chen", 
    role: "IT Staff", 
    dept: "Infrastructure", 
    seed: "Alex", 
    bgColor: "dce5f5",
    detailTitle: "Infrastructure Support",
    bullets: ["Resolves hardware & software issues", "Manages network access", "Maintains server stability"],
    tags: ["Support", "IT"]
  },
  { 
    name: "Maria Santos", 
    role: "Employee", 
    dept: "Operations", 
    seed: "Maria", 
    bgColor: "fde8d8",
    detailTitle: "Employee Self-Service",
    bullets: ["Finds answers in KB", "Submits HR requests", "Tracks ticket status"],
    tags: ["Employee", "Help"]
  },
  { 
    name: "Jordan Kim", 
    role: "HR Staff", 
    dept: "People Ops", 
    seed: "Jordan", 
    bgColor: "fef3c7",
    detailTitle: "People Operations",
    bullets: ["Manages onboarding tickets", "Resolves benefits inquiries", "Coordinates training"],
    tags: ["HR", "People"]
  },
  { 
    name: "Sam Patel", 
    role: "Manager", 
    dept: "IT Division", 
    seed: "Sam", 
    bgColor: "ede9fe",
    detailTitle: "IT Division Management",
    bullets: ["Oversees IT queue", "Tracks SLA compliance", "Allocates resources"],
    tags: ["Management", "IT"]
  },
  { 
    name: "Priya Nair", 
    role: "IT Staff", 
    dept: "Security", 
    seed: "Priya", 
    bgColor: "dcfce7",
    detailTitle: "Cybersecurity Support",
    bullets: ["Handles security alerts", "Investigates access issues", "Enforces security policies"],
    tags: ["Security", "IT"]
  },
  { 
    name: "Marcus Johnson", 
    role: "Employee", 
    dept: "Marketing", 
    seed: "Marcus", 
    bgColor: "fee2e2",
    detailTitle: "Marketing Requests",
    bullets: ["Submits creative tickets", "Requests tool access", "Tracks campaign support"],
    tags: ["Marketing", "Employee"]
  },
  { 
    name: "Layla Ahmed", 
    role: "HR Staff", 
    dept: "Recruitment", 
    seed: "Layla", 
    bgColor: "e0f2fe",
    detailTitle: "Recruitment Coordination",
    bullets: ["Manages candidate onboarding", "Handles interview logistics", "Schedules orientations"],
    tags: ["HR", "Recruitment"]
  },
  { 
    name: "Emma Davis", 
    role: "Manager", 
    dept: "HR Division", 
    seed: "Emma", 
    bgColor: "fce7f3",
    detailTitle: "HR Division Management",
    bullets: ["Oversees HR queue", "Tracks team performance", "Manages policy updates"],
    tags: ["Management", "HR"]
  },
];

function PersonCard({ 
  character, 
  animDelay, 
  isFlipped, 
  onFlip 
}: { 
  character: Character; 
  animDelay: string; 
  isFlipped: boolean;
  onFlip: () => void;
}) {
  const dicebearUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${character.seed}&backgroundColor=${character.bgColor}&backgroundType=solid`;

  const roleCls = 
    character.role === "IT Staff" ? "bg-blue-100 text-blue-700" :
    character.role === "HR Staff" ? "bg-amber-100 text-amber-700" :
    character.role === "Manager" ? "bg-purple-100 text-purple-700" :
    "bg-slate-100 text-slate-700";

  return (
    <div 
      className="w-44 bg-white dark:bg-slate-800 rounded-3xl shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden mx-3 flex-shrink-0 relative transition-all duration-500"
      style={{
        animation: isFlipped ? "none" : `float-up 3s ease-in-out infinite`,
        animationDelay: animDelay,
        height: "300px"
      }}
    >
      {/* Character Card (Front) */}
      <div className={`absolute inset-0 flex flex-col transition-opacity duration-500 ${isFlipped ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        {/* Character illustration — takes up top 60% of card */}
        <div className="h-52 flex items-end justify-center relative" style={{ backgroundColor: `#${character.bgColor}` }}>
          <img src={dicebearUrl} className="w-40 h-40 object-contain pb-2" alt={character.name} />
          {/* Subtle gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </div>
        
        {/* Flip button (Absolute top-right) */}
        <button 
          onClick={onFlip}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-colors z-10"
        >
          +
        </button>

        {/* Info — bottom 40% */}
        <div className="p-4 text-center flex-1 flex flex-col justify-center items-center">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${roleCls}`}>
            {character.role}
          </span>
        </div>
      </div>

      {/* Detail Card (Back) */}
      <div className={`absolute inset-0 flex flex-col p-4 transition-opacity duration-500 ${isFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden" style={{ backgroundColor: `#${character.bgColor}` }}>
            <img src={dicebearUrl} className="w-full h-full" alt={character.name} />
          </div>
          <div className="min-w-0">
            <p className="font-black text-xs text-slate-900 dark:text-white truncate">{character.detailTitle}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{character.name}</p>
          </div>
        </div>
        
        <ul className="space-y-1.5 flex-1 overflow-y-auto">
          {character.bullets.map((bullet, i) => (
            <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1">
              <span className="text-emerald-500">✓</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1 flex-wrap">
            {character.tags.map((tag, i) => (
              <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                {tag}
              </span>
            ))}
          </div>
          <button 
            onClick={onFlip}
            className="w-6 h-6 rounded-full bg-slate-100  flex items-center justify-center text-slate-600  hover:bg-slate-200  transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PeopleMarquee() {
  // Duplicate the array once for seamless loop
  const items = [...CHARACTERS, ...CHARACTERS];
  const [flippedPerson, setFlippedPerson] = useState<string | null>(null);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 overflow-hidden">
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .track-left { 
          display: flex;
          width: max-content; 
          animation: slide-left 30s linear infinite; 
        }
        .track-left:hover { 
          animation-play-state: paused; 
        }
        .track-paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-14">
        <p className="text-xs font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-3">Your whole team, one platform</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Built for every person in your company
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Employees, IT staff, HR teams and managers — everyone has a role-specific experience.
        </p>
      </div>

      {/* Marquee — ONE ROW, scrolling left */}
      <div 
        className="relative"
        style={{ 
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' 
        }}
      >
        <div className={`track-left flex py-4 ${flippedPerson ? "track-paused" : ""}`}>
          {items.map((c, i) => (
            <PersonCard 
              key={i} 
              character={c} 
              animDelay={`${i * 0.4}s`} 
              isFlipped={flippedPerson === c.name}
              onFlip={() => setFlippedPerson(flippedPerson === c.name ? null : c.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
