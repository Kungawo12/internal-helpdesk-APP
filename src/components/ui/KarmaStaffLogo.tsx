export default function KarmaStaffLogo({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="18" fill="#1a3461" />
      {/* Bar chart bars — ascending left to right */}
      <rect x="12" y="62" width="12" height="22" rx="2" fill="white" />
      <rect x="28" y="50" width="12" height="34" rx="2" fill="white" />
      <rect x="44" y="36" width="12" height="48" rx="2" fill="white" />
      {/* k letter — vertical stroke */}
      <rect x="62" y="16" width="10" height="68" rx="2" fill="white" />
      {/* k letter — upper diagonal arm */}
      <rect
        x="66"
        y="42"
        width="22"
        height="9"
        rx="2"
        fill="white"
        transform="rotate(-35 66 42)"
      />
      {/* k letter — lower diagonal arm */}
      <rect
        x="66"
        y="52"
        width="22"
        height="9"
        rx="2"
        fill="white"
        transform="rotate(35 66 52)"
      />
    </svg>
  );
}
