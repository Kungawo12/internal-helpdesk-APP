"use client";

interface Character {
  name: string;
  role: string;
  dept: string;
  seed: string;
  bgColor: string;
}

const CHARACTERS: Character[] = [
  { name: "Alex Chen", role: "IT Staff", dept: "Infrastructure", seed: "Alex", bgColor: "dce5f5" },
  { name: "Maria Santos", role: "Employee", dept: "Operations", seed: "Maria", bgColor: "fde8d8" },
  { name: "Jordan Kim", role: "HR Staff", dept: "People Ops", seed: "Jordan", bgColor: "fef3c7" },
  { name: "Sam Patel", role: "Manager", dept: "IT Division", seed: "Sam", bgColor: "ede9fe" },
  { name: "Priya Nair", role: "IT Staff", dept: "Security", seed: "Priya", bgColor: "dcfce7" },
  { name: "Marcus Johnson", role: "Employee", dept: "Marketing", seed: "Marcus", bgColor: "fee2e2" },
  { name: "Layla Ahmed", role: "HR Staff", dept: "Recruitment", seed: "Layla", bgColor: "e0f2fe" },
  { name: "Emma Davis", role: "Manager", dept: "HR Division", seed: "Emma", bgColor: "fce7f3" },
];

function PersonCard({ character, animDelay }: { character: Character; animDelay: string }) {
  const dicebearUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${character.seed}&backgroundColor=${character.bgColor}&backgroundType=solid`;

  const roleCls = 
    character.role === "IT Staff" ? "bg-blue-100 text-blue-700" :
    character.role === "HR Staff" ? "bg-amber-100 text-amber-700" :
    character.role === "Manager" ? "bg-purple-100 text-purple-700" :
    "bg-slate-100 text-slate-700";

  return (
    <div 
      className="w-40 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden mx-3 flex-shrink-0"
      style={{ 
        animation: `float-up 3s ease-in-out infinite`,
        animationDelay: animDelay 
      }}
    >
      {/* Character illustration — takes up top 60% of card */}
      <div className="h-40 flex items-end justify-center" style={{ backgroundColor: `#${character.bgColor}` }}>
        <img src={dicebearUrl} className="w-32 h-32" alt={character.name} />
      </div>
      {/* Info — bottom 40% */}
      <div className="p-3 text-center">
        <p className="font-black text-sm text-slate-900 truncate">{character.name}</p>
        <p className="text-[10px] text-slate-400 mb-1 truncate">{character.dept}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleCls}`}>
          {character.role}
        </span>
      </div>
    </div>
  );
}

export default function PeopleMarquee() {
  // Duplicate the array once for seamless loop
  const items = [...CHARACTERS, ...CHARACTERS];

  return (
    <section className="py-20 bg-white overflow-hidden">
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
      `}</style>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-14">
        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Your whole team, one platform</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Built for every person in your company
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
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
        <div className="track-left flex py-4">
          {items.map((c, i) => (
            <PersonCard key={i} character={c} animDelay={`${(i % CHARACTERS.length) * 0.4}s`} />
          ))}
        </div>
      </div>
    </section>
  );
}
