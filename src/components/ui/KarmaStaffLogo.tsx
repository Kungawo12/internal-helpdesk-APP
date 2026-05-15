export default function KarmaStaffLogo({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/karma-staff-logo.png"
      alt="Karma Staff"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
