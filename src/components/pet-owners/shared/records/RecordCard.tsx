"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@mui/icons-material";

type Props = {
  petName: string;
  time: string;
  note: string;
  avatarUrl?: string;
  imageUrls?: string[];
  onClick?: () => void;
};

export default function RecordCard({
  petName,
  time,
  note,
  avatarUrl,
  imageUrls = [],
  onClick,
}: Props) {
  const firstImg = imageUrls[0];
  const restCount = Math.max(0, imageUrls.length - 1);

  return (
    <Card
      headerRight={time}
      onClick={onClick}
      className="w-full text-left transition hover:bg-zinc-50 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        {/* Colored pill bar */}
        <div className="w-1 self-stretch rounded-full bg-pink-400 shrink-0 min-h-[40px]" />

        {/* Pet avatar */}
        {avatarUrl && (
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-100 shrink-0">
            <Image src={avatarUrl} alt={petName} fill className="object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-900 leading-snug">
            {petName}
          </div>
          <div className="mt-0.5 text-sm line-clamp-1">
            {note}
          </div>
        </div>

        {/* Thumbnail preview */}
        {firstImg && (
          <div className="relative h-10 w-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
            <Image src={firstImg} alt="" fill className="object-cover" />
            {restCount > 0 && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <span className="text-white text-[10px] font-semibold">+{restCount}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
