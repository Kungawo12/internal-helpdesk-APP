export default function KarmaStaffLogo({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/karma-staff-logo.png"
      alt="Karma Staff"
      width={size}
      height={size}
      className={`${className} dark:invert dark:brightness-125 transition-all`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
