"use client";

import Image from "next/image";

type Props = {
  petName: string;
  time: string; // เช่น "11.00 A.M."
  note: string;
  avatarUrl?: string;
  imageCount?: number;
  onClick?: () => void;
};

export default function SymptomCard({
  petName,
  time,
  note,
  avatarUrl,
  imageCount = 0,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left relative rounded-2xl bg-white border border-zinc-100 shadow-sm p-4 hover:bg-zinc-50 active:scale-[0.99] transition"
    >
      {/* Time (top-right) */}
      <div className="absolute right-4 top-4 text-xs text-zinc-500">{time}</div>

      <div className="flex items-start gap-3 pr-10">
        {/* Avatar */}
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-zinc-100 shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={petName} fill className="object-cover" />
          ) : null}
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900">{petName}</div>
          <div className="mt-1 text-sm text-zinc-600 line-clamp-2">{note}</div>
        </div>

        {/* Image count badge */}
        {imageCount > 0 && (
          <div className="ml-2 shrink-0">
            <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600">
              +{imageCount}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
