"use client";

const ROLE_COLORS: Record<string, { bg: string; text: string; badge: string; badgeText: string }> = {
  "IT Staff":  { bg: "bg-blue-500",   text: "text-white", badge: "bg-blue-100",   badgeText: "text-blue-700" },
  "HR Staff":  { bg: "bg-amber-500",  text: "text-white", badge: "bg-amber-100",  badgeText: "text-amber-700" },
  "Manager":   { bg: "bg-purple-500", text: "text-white", badge: "bg-purple-100", badgeText: "text-purple-700" },
  "Employee":  { bg: "bg-slate-600",  text: "text-white", badge: "bg-slate-100",  badgeText: "text-slate-600" },
  "Admin":     { bg: "bg-red-500",    text: "text-white", badge: "bg-red-100",    badgeText: "text-red-700" },
};

const ROW_ONE = [
  { name: "Alex Chen",      initials: "AC", role: "IT Staff",  dept: "Infrastructure" },
  { name: "Maria Santos",   initials: "MS", role: "Employee",  dept: "Operations" },
  { name: "Jordan Kim",     initials: "JK", role: "HR Staff",  dept: "People Ops" },
  { name: "Sam Patel",      initials: "SP", role: "Manager",   dept: "IT Division" },
  { name: "Chris Taylor",   initials: "CT", role: "Employee",  dept: "Finance" },
  { name: "Priya Nair",     initials: "PN", role: "IT Staff",  dept: "Security" },
  { name: "Marcus Johnson", initials: "MJ", role: "Employee",  dept: "Marketing" },
  { name: "Layla Ahmed",    initials: "LA", role: "HR Staff",  dept: "Recruitment" },
];

const ROW_TWO = [
  { name: "David Lee",      initials: "DL", role: "Admin",     dept: "Platform" },
  { name: "Sophie Brown",   initials: "SB", role: "Employee",  dept: "Legal" },
  { name: "Tom Wilson",     initials: "TW", role: "IT Staff",  dept: "Networks" },
  { name: "Aisha Mohammed", initials: "AM", role: "Manager",   dept: "HR Division" },
  { name: "Ryan Chen",      initials: "RC", role: "Employee",  dept: "Product" },
  { name: "Emma Davis",     initials: "ED", role: "HR Staff",  dept: "Benefits" },
  { name: "James Park",     initials: "JP", role: "IT Staff",  dept: "Dev Ops" },
  { name: "Zoe Thompson",   initials: "ZT", role: "Employee",  dept: "Design" },
];

interface PersonCardProps {
  name: string;
  initials: string;
  role: string;
  dept: string;
  animDelay?: string;
}

function PersonCard({ name, initials, role, dept, animDelay = "0s" }: PersonCardProps) {
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS["Employee"];
  return (
    <div
      className="flex-shrink-0 w-44 bg-white rounded-2xl p-4 shadow-md border border-slate-100 mx-3 select-none"
      style={{ animation: `float 3s ease-in-out infinite`, animationDelay: animDelay }}
    >
      <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-lg`}>
        {initials}
      </div>
      <p className="text-sm font-black text-slate-900 text-center leading-tight truncate">{name}</p>
      <p className="text-[10px] text-slate-400 text-center mt-0.5 mb-2 truncate">{dept}</p>
      <div className="flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" style={{ animation: "pulse 2s infinite" }} />
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge} ${colors.badgeText}`}>
          {role}
        </span>
      </div>
    </div>
  );
}

export default function PeopleMarquee() {
  // Duplicate each row for seamless loop
  const row1 = [...ROW_ONE, ...ROW_ONE];
  const row2 = [...ROW_TWO, ...ROW_TWO];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .marquee-left {
          display: flex;
          width: max-content;
          animation: marquee-left 35s linear infinite;
        }
        .marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-right 35s linear infinite;
        }
        .marquee-left:hover,
        .marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-4xl mx-auto text-center px-6 mb-12">
        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Your whole team, one platform</p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Built for every person in your company
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          From employees raising their first ticket to IT staff resolving issues and managers tracking performance — everyone has a home here.
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative mb-4" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <div className="marquee-left py-2">
          {row1.map((p, i) => (
            <PersonCard
              key={`r1-${i}`}
              {...p}
              animDelay={`${(i % 8) * 0.4}s`}
            />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
        <div className="marquee-right py-2">
          {row2.map((p, i) => (
            <PersonCard
              key={`r2-${i}`}
              {...p}
              animDelay={`${(i % 8) * 0.3 + 0.2}s`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
