export default function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string[] | string | number | boolean | null | undefined;
}) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-900">
        {Array.isArray(value) ? (value.length > 0 ? value.join(", ") : "-") : (value ?? "-")}
      </div>
    </div>
  );
}
