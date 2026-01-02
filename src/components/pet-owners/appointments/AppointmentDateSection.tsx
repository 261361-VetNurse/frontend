"use client";

export default function AppointmentDateSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-zinc-800">{label}</div>
      <div className="h-px bg-zinc-200" />
      <div className="space-y-3">{children}</div>
    </div>
  );
}
