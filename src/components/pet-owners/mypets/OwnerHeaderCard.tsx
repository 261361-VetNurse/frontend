"use client";

import Image from "next/image";

type OwnerHeaderCardProps = {
  name: string;
  ownerId: string;
  avatarUrl?: string;
};

export default function OwnerHeaderCard({
  name,
  ownerId,
  avatarUrl = "/Ava.svg",
}: OwnerHeaderCardProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-3 flex items-center gap-3">
      {/* Avatar */}
      <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-100 shrink-0">
        <Image
          src={avatarUrl}
          alt="Owner Avatar"
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Owner Info */}
      <div className="min-w-0">
        <div className="font-semibold text-zinc-900 leading-5 truncate">
          {name}
        </div>
        <div className="text-xs text-zinc-500">ID: {ownerId}</div>
      </div>
    </div>
  );
}
