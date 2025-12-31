"use client";

export default function SymptomDateSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="text-sm font-semibold text-zinc-900">{label}</div>
      <div className="mt-2 border-b border-zinc-200" />
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
