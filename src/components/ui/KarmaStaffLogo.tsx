export default function KarmaStaffLogo({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/karma-staff-logo.png"
      alt="Karma Staff"
      width={size}
      height={size}
      className={`${className} dark:bg-white dark:rounded-md dark:p-0.5 transition-all`}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
