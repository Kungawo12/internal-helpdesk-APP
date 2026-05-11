"use client";

type HairStyle = "short" | "long" | "curly" | "bun";

interface Character {
  name: string;
  role: string;
  dept: string;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  shirt: string;
  hasGlasses?: boolean;
}

const ROLE_BADGES: Record<string, { badge: string; text: string }> = {
  "IT Staff":  { badge: "bg-blue-100",   text: "text-blue-700" },
  "HR Staff":  { badge: "bg-amber-100",  text: "text-amber-700" },
  "Manager":   { badge: "bg-purple-100", text: "text-purple-700" },
  "Employee":  { badge: "bg-slate-100",  text: "text-slate-600" },
  "Admin":     { badge: "bg-red-100",    text: "text-red-700" },
};

const SHIRT_LIGHT: Record<string, string> = {
  "#3B82F6": "#DBEAFE",
  "#EC4899": "#FCE7F3",
  "#F59E0B": "#FEF3C7",
  "#9333EA": "#F3E8FF",
  "#10B981": "#D1FAE5",
  "#EF4444": "#FEE2E2",
  "#E879F9": "#FAE8FF",
  "#64748B": "#F1F5F9",
  "#14B8A6": "#CCFBF1",
  "#84CC16": "#ECFCCB",
};

const ROW_ONE: Character[] = [
  { name: "Alex Chen",      role: "IT Staff",  dept: "Infrastructure", skin: "#F3BD94", hair: "#1A1A1A", hairStyle: "short",  shirt: "#3B82F6" },
  { name: "Maria Santos",   role: "Employee",  dept: "Operations",     skin: "#C97B4B", hair: "#2D1B10", hairStyle: "long",   shirt: "#EC4899" },
  { name: "Jordan Kim",     role: "HR Staff",  dept: "People Ops",     skin: "#FCCFBA", hair: "#4A2E14", hairStyle: "curly",  shirt: "#F59E0B" },
  { name: "Sam Patel",      role: "Manager",   dept: "IT Division",    skin: "#C68642", hair: "#1A1A1A", hairStyle: "short",  shirt: "#9333EA" },
  { name: "Priya Nair",     role: "IT Staff",  dept: "Security",       skin: "#D4956A", hair: "#1A1A1A", hairStyle: "long",   shirt: "#3B82F6" },
  { name: "Marcus Johnson", role: "Employee",  dept: "Marketing",      skin: "#7D4E1F", hair: "#1A1A1A", hairStyle: "curly",  shirt: "#10B981" },
  { name: "Layla Ahmed",    role: "HR Staff",  dept: "Recruitment",    skin: "#C68642", hair: "#1A1A1A", hairStyle: "bun",    shirt: "#F59E0B" },
  { name: "Chris Taylor",   role: "Employee",  dept: "Finance",        skin: "#FCCFBA", hair: "#C48A00", hairStyle: "short",  shirt: "#64748B" },
];

const ROW_TWO: Character[] = [
  { name: "David Lee",      role: "Admin",     dept: "Platform",       skin: "#F3BD94", hair: "#2D1B10", hairStyle: "short",  shirt: "#EF4444" },
  { name: "Sophie Brown",   role: "Employee",  dept: "Legal",          skin: "#F5D5C8", hair: "#8B3A0F", hairStyle: "long",   shirt: "#E879F9" },
  { name: "Tom Wilson",     role: "IT Staff",  dept: "Networks",       skin: "#E5956A", hair: "#4A2E14", hairStyle: "short",  shirt: "#3B82F6" },
  { name: "Aisha Mohammed", role: "Manager",   dept: "HR Division",    skin: "#7D4E1F", hair: "#1A1A1A", hairStyle: "curly",  shirt: "#9333EA" },
  { name: "Ryan Chen",      role: "Employee",  dept: "Product",        skin: "#F5D5C8", hair: "#1A1A1A", hairStyle: "short",  shirt: "#14B8A6" },
  { name: "Emma Davis",     role: "HR Staff",  dept: "Benefits",       skin: "#F3BD94", hair: "#C48A00", hairStyle: "bun",    shirt: "#F59E0B" },
  { name: "James Park",     role: "IT Staff",  dept: "Dev Ops",        skin: "#E5956A", hair: "#1A1A1A", hairStyle: "short",  shirt: "#3B82F6", hasGlasses: true },
  { name: "Zoe Thompson",   role: "Employee",  dept: "Design",         skin: "#F5D5C8", hair: "#888888", hairStyle: "short",  shirt: "#84CC16" },
];

function HairPath({ style, color }: { style: HairStyle; color: string }) {
  if (style === "short") return (
    <path d="M19 43 C19 18 34 7 50 7 C66 7 81 18 81 43 L81 38 C81 15 66 5 50 5 C34 5 19 15 19 38Z" fill={color} />
  );
  if (style === "long") return (
    <>
      <path d="M19 43 C19 18 34 7 50 7 C66 7 81 18 81 43 L81 38 C81 15 66 5 50 5 C34 5 19 15 19 38Z" fill={color} />
      <path d="M19 43 C15 60 12 78 14 98 L24 96 C22 76 24 61 27 47Z" fill={color} />
      <path d="M81 43 C85 60 88 78 86 98 L76 96 C78 76 76 61 73 47Z" fill={color} />
    </>
  );
  if (style === "curly") return (
    <>
      <circle cx="50" cy="22" r="21" fill={color} />
      <circle cx="30" cy="33" r="15" fill={color} />
      <circle cx="70" cy="33" r="15" fill={color} />
      <circle cx="20" cy="48" r="10" fill={color} />
      <circle cx="80" cy="48" r="10" fill={color} />
    </>
  );
  // bun
  return (
    <>
      <path d="M21 46 C21 20 35 9 50 9 C65 9 79 20 79 46 L79 40 C77 20 64 12 50 12 C36 12 23 20 21 40Z" fill={color} />
      <circle cx="50" cy="10" r="11" fill={color} />
    </>
  );
}

function CharacterSVG({ skin, hair, hairStyle, shirt, hasGlasses }: Omit<Character, "name" | "role" | "dept">) {
  return (
    <svg viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Shirt / body */}
      <ellipse cx="12"  cy="96" rx="22" ry="15" fill={shirt} />
      <ellipse cx="88"  cy="96" rx="22" ry="15" fill={shirt} />
      <path d="M27 82 Q50 76 73 82 L80 118 Q50 122 20 118Z" fill={shirt} />
      {/* Collar */}
      <path d="M43 75 Q50 80 57 75 L54 68 Q50 72 46 68Z" fill={shirt} opacity="0.7" />

      {/* Neck */}
      <rect x="43" y="64" width="14" height="15" rx="5" fill={skin} />

      {/* Head */}
      <circle cx="50" cy="44" r="31" fill={skin} />

      {/* Hair behind head for long styles */}
      {(hairStyle === "long" || hairStyle === "bun") && (
        <HairPath style={hairStyle} color={hair} />
      )}

      {/* Head again on top for long hair (so head overlaps hair sides) */}
      {hairStyle !== "long" && hairStyle !== "bun" && (
        <HairPath style={hairStyle} color={hair} />
      )}

      {/* Ears */}
      <ellipse cx="19" cy="46" rx="5.5" ry="6.5" fill={skin} />
      <ellipse cx="81" cy="46" rx="5.5" ry="6.5" fill={skin} />
      {/* Inner ear */}
      <ellipse cx="19" cy="46" rx="2.5" ry="3.5" fill={skin} opacity="0.6" />
      <ellipse cx="81" cy="46" rx="2.5" ry="3.5" fill={skin} opacity="0.6" />

      {/* Re-draw head circle to cover hair overlap on sides */}
      <circle cx="50" cy="44" r="31" fill={skin} />

      {/* Hair on top of head */}
      <HairPath style={hairStyle} color={hair} />

      {/* Eyebrows */}
      <path d="M34 36 Q40 33 45 36" stroke={hair === "#888888" ? "#555" : hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M55 36 Q60 33 66 36" stroke={hair === "#888888" ? "#555" : hair} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Eye whites */}
      <ellipse cx="40" cy="45" rx="5.5" ry="6" fill="white" />
      <ellipse cx="60" cy="45" rx="5.5" ry="6" fill="white" />

      {/* Irises */}
      <circle cx="40" cy="46" r="3.2" fill="#2D3A4A" />
      <circle cx="60" cy="46" r="3.2" fill="#2D3A4A" />

      {/* Pupils / shine */}
      <circle cx="41" cy="45" r="1.2" fill="white" />
      <circle cx="61" cy="45" r="1.2" fill="white" />

      {/* Nose */}
      <path d="M47 54 Q50 58 53 54" stroke={skin} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* Cheeks */}
      <ellipse cx="31" cy="57" rx="7" ry="4.5" fill="#EF9090" opacity="0.22" />
      <ellipse cx="69" cy="57" rx="7" ry="4.5" fill="#EF9090" opacity="0.22" />

      {/* Smile */}
      <path d="M42 61 Q50 68 58 61" stroke="#B06050" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* Glasses */}
      {hasGlasses && (
        <>
          <rect x="32" y="41" width="15" height="11" rx="3.5" stroke="#3D3D3D" strokeWidth="2" fill="rgba(200,220,255,0.25)" />
          <rect x="53" y="41" width="15" height="11" rx="3.5" stroke="#3D3D3D" strokeWidth="2" fill="rgba(200,220,255,0.25)" />
          <path d="M47 46.5 L53 46.5" stroke="#3D3D3D" strokeWidth="2" />
          <path d="M22 46 L32 46" stroke="#3D3D3D" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M68 46 L78 46" stroke="#3D3D3D" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PersonCard({ character, animDelay }: { character: Character; animDelay: string }) {
  const badge = ROLE_BADGES[character.role] ?? ROLE_BADGES["Employee"];
  const bgLight = SHIRT_LIGHT[character.shirt] ?? "#F8FAFC";

  return (
    <div
      className="flex-shrink-0 w-36 bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 mx-3 select-none"
      style={{ animation: `float-char 3.5s ease-in-out infinite`, animationDelay: animDelay }}
    >
      {/* Character illustration area */}
      <div className="h-40 flex items-end justify-center px-2 pt-4 pb-0" style={{ background: `linear-gradient(180deg, ${bgLight} 0%, white 100%)` }}>
        <div className="w-28 h-36">
          <CharacterSVG
            skin={character.skin}
            hair={character.hair}
            hairStyle={character.hairStyle}
            shirt={character.shirt}
            hasGlasses={character.hasGlasses}
          />
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pb-4 pt-2 text-center">
        <p className="font-black text-sm text-slate-900 leading-tight truncate">{character.name}</p>
        <p className="text-[10px] text-slate-400 mb-2 truncate">{character.dept}</p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.badge} ${badge.text}`}>
            {character.role}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PeopleMarquee() {
  const row1 = [...ROW_ONE, ...ROW_ONE];
  const row2 = [...ROW_TWO, ...ROW_TWO];

  return (
    <section className="py-20 bg-[#f8fafc] overflow-hidden">
      <style>{`
        @keyframes float-char {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes slide-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes slide-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .track-left  { display: flex; width: max-content; animation: slide-left  45s linear infinite; }
        .track-right { display: flex; width: max-content; animation: slide-right 45s linear infinite; }
        .track-left:hover, .track-right:hover { animation-play-state: paused; }
      `}</style>

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-14">
        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Your whole team, one platform</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Built for every person in your company
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Employees, IT staff, HR teams, and managers — everyone has a role-specific experience built for them.
        </p>
      </div>

      {/* Row 1 — left */}
      <div
        className="relative mb-6"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="track-left py-2">
          {row1.map((c, i) => (
            <PersonCard key={`r1-${i}`} character={c} animDelay={`${(i % 8) * 0.5}s`} />
          ))}
        </div>
      </div>

      {/* Row 2 — right */}
      <div
        className="relative"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="track-right py-2">
          {row2.map((c, i) => (
            <PersonCard key={`r2-${i}`} character={c} animDelay={`${(i % 8) * 0.4 + 0.3}s`} />
          ))}
        </div>
      </div>
    </section>
  );
}
