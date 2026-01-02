"use client";

type StatCardProps = {
  title: string;
  value: number;
};

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="flex-1 rounded-2xl bg-white shadow-sm border border-zinc-100 p-4">
      <div className="text-sm text-zinc-600">{title}</div>
      <div className="mt-2 text-4xl font-semibold text-zinc-900 leading-none">
        {value}
      </div>
    </div>
  );
}
