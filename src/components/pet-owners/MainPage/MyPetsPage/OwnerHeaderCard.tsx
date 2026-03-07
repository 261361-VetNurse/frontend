"use client";

import Profile from "@/components/pet-owners/shared/Profile";

import { useRouter } from '@/hooks/use-next-routing';

type OwnerHeaderCardProps = {
  name: string;
  ownerId: string;
  avatarUrl?: string | null;
  OwnerPageUrl?: string | null;
};

export default function OwnerHeaderCard({
  name,
  ownerId,
  avatarUrl,
  OwnerPageUrl
}: OwnerHeaderCardProps) {
  const router = useRouter();

  return (
    <div
      className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-3 flex items-center gap-3"
      onClick={() => { if (OwnerPageUrl) router.push(OwnerPageUrl) }}>
      {/* Avatar */}
      <Profile imageUrl={avatarUrl} size={48} />

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
