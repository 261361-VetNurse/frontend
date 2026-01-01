"use client";

import Image from "next/image";

type Props = {
  petName: string;
  time: string;
  note: string;
  avatarUrl?: string;
  imageUrls?: string[];
  onClick?: () => void;
};

export default function SymptomCard({
  petName,
  time,
  note,
  avatarUrl,
  imageUrls = [],
  onClick,
}: Props) {
  const firstImg = imageUrls[0];
  const restCount = Math.max(0, imageUrls.length - 1);
  const showPreview = Boolean(firstImg);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl bg-white border border-zinc-100 shadow-sm hover:bg-zinc-50 active:scale-[0.99] transition"
    >
      {/* Top row: time */}
      <div className="px-4 pt-3">
        <div className="text-right text-xs text-zinc-500">{time}</div>
        <div className="mt-2 h-px w-full bg-zinc-200" />
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-zinc-100 shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={petName} fill className="object-cover" />
            ) : null}
          </div>

          {/* Text */}
          <div className={`min-w-0 flex-1 ${showPreview ? "pr-16" : ""}`}>
            <div className="text-sm font-semibold text-zinc-900">{petName}</div>
            <div className="mt-1 text-sm text-zinc-600 line-clamp-2">{note}</div>
          </div>

          {/* Right preview */}
          {showPreview ? (
            <div className="shrink-0">
              <div className="relative h-14 w-14 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200">
                <Image src={firstImg!} alt="symptom" fill className="object-cover" />
                {restCount > 0 && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">+{restCount}</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
