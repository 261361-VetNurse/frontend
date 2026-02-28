"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";

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
  const firstImg = imageUrls[0] || "https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/default_image.webp";
  const restCount = Math.max(0, imageUrls.length - 1);

  return (
    <Card headerRight={time} onClick={onClick}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-zinc-100 shrink-0">
          {avatarUrl && (
            <Image src={avatarUrl} alt={petName} fill className="object-cover" />
          )}
        </div>

        {/* Text */}
        <div className={`min-w-0 flex-1 ${firstImg ? "pr-16" : ""}`}>
          <div className="text-sm font-semibold text-zinc-900">{petName}</div>
          <div className="mt-1 text-sm text-zinc-600 line-clamp-2">
            {note}
          </div>
        </div>

        {/* Preview */}
        {firstImg && (
          <div className="relative h-14 w-14 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
            <Image src={firstImg} alt="" fill className="object-cover" />
            {restCount > 0 && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  +{restCount}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
