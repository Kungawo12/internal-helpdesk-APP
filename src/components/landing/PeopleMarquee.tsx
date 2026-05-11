"use client";

const ROLE_COLORS: Record<string, { ring: string; badge: string; badgeText: string }> = {
  "IT Staff":  { ring: "ring-blue-400",   badge: "bg-blue-100",   badgeText: "text-blue-700" },
  "HR Staff":  { ring: "ring-amber-400",  badge: "bg-amber-100",  badgeText: "text-amber-700" },
  "Manager":   { ring: "ring-purple-400", badge: "bg-purple-100", badgeText: "text-purple-700" },
  "Employee":  { ring: "ring-slate-300",  badge: "bg-slate-100",  badgeText: "text-slate-600" },
  "Admin":     { ring: "ring-red-400",    badge: "bg-red-100",    badgeText: "text-red-700" },
};

// DiceBear "adventurer" style gives illustrated human character faces
const AVATAR_BASE = "https://api.dicebear.com/9.x/adventurer/svg";

const ROW_ONE = [
  { name: "Alex Chen",      seed: "Alex",    role: "IT Staff",  dept: "Infrastructure", bg: "dce5f5" },
  { name: "Maria Santos",   seed: "Maria",   role: "Employee",  dept: "Operations",     bg: "fde8d8" },
  { name: "Jordan Kim",     seed: "Jordan",  role: "HR Staff",  dept: "People Ops",     bg: "fef3c7" },
  { name: "Sam Patel",      seed: "Sam",     role: "Manager",   dept: "IT Division",    bg: "ede9fe" },
  { name: "Chris Taylor",   seed: "Chris",   role: "Employee",  dept: "Finance",        bg: "dcfce7" },
  { name: "Priya Nair",     seed: "Priya",   role: "IT Staff",  dept: "Security",       bg: "dce5f5" },
  { name: "Marcus Johnson", seed: "Marcus",  role: "Employee",  dept: "Marketing",      bg: "fee2e2" },
  { name: "Layla Ahmed",    seed: "Layla",   role: "HR Staff",  dept: "Recruitment",    bg: "fef3c7" },
];

const ROW_TWO = [
  { name: "David Lee",      seed: "David",   role: "Admin",     dept: "Platform",       bg: "fecaca" },
  { name: "Sophie Brown",   seed: "Sophie",  role: "Employee",  dept: "Legal",          bg: "e0f2fe" },
  { name: "Tom Wilson",     seed: "Tom",     role: "IT Staff",  dept: "Networks",       bg: "dce5f5" },
  { name: "Aisha Mohammed", seed: "Aisha",   role: "Manager",   dept: "HR Division",    bg: "ede9fe" },
  { name: "Ryan Chen",      seed: "Ryan",    role: "Employee",  dept: "Product",        bg: "d1fae5" },
  { name: "Emma Davis",     seed: "Emma",    role: "HR Staff",  dept: "Benefits",       bg: "fef3c7" },
  { name: "James Park",     seed: "James",   role: "IT Staff",  dept: "Dev Ops",        bg: "dce5f5" },
  { name: "Zoe Thompson",   seed: "Zoe",     role: "Employee",  dept: "Design",         bg: "fce7f3" },
];

interface PersonCardProps {
  name: string;
  seed: string;
  role: string;
  dept: string;
  bg: string;
  animDelay?: string;
}

function PersonCard({ name, seed, role, dept, bg, animDelay = "0s" }: PersonCardProps) {
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS["Employee"];
  const avatarUrl = `${AVATAR_BASE}?seed=${seed}&backgroundColor=${bg}&backgroundType=solid&radius=50`;

  return (
    <div
      className="flex-shrink-0 w-44 bg-white rounded-2xl p-4 shadow-md border border-slate-100 mx-3 select-none cursor-default"
      style={{ animation: `float 3s ease-in-out infinite`, animationDelay: animDelay }}
    >
      {/* Illustrated character face */}
      <div className={`w-16 h-16 rounded-2xl mx-auto mb-3 ring-2 ${colors.ring} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={name}
          width={64}
          height={64}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <p className="text-sm font-black text-slate-900 text-center leading-tight truncate">{name}</p>
      <p className="text-[10px] text-slate-400 text-center mt-0.5 mb-2 truncate">{dept}</p>

      <div className="flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge} ${colors.badgeText}`}>
          {role}
        </span>
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .row-left {
          display: flex;
          width: max-content;
          animation: marquee-left 40s linear infinite;
        }
        .row-right {
          display: flex;
          width: max-content;
          animation: marquee-right 40s linear infinite;
        }
        .row-left:hover, .row-right:hover {
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
      <div
        className="relative mb-5"
        style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)", maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
      >
        <div className="row-left py-3">
          {row1.map((p, i) => (
            <PersonCard key={`r1-${i}`} {...p} animDelay={`${(i % 8) * 0.45}s`} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div
        className="relative"
        style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)", maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
      >
        <div className="row-right py-3">
          {row2.map((p, i) => (
            <PersonCard key={`r2-${i}`} {...p} animDelay={`${(i % 8) * 0.35 + 0.25}s`} />
          ))}
        </div>
      </div>
    </section>
  );
}
