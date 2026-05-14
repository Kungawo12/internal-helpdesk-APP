export default function KarmaStaffLogo({ size = 64 }: { size?: number }) {
  return (
    <img
      src="/karma-staff-logo.png"
      alt="Karma Staff"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
