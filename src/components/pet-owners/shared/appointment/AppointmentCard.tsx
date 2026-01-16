"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { LocationOn, AccessTime } from "@mui/icons-material";

export type AppointmentCardProps = {
  petName: string;
  time: string;
  location: string;
  avatarUrl?: string;
  onClick?: () => void;
  className?: string;
};

export default function AppointmentCard({
  petName,
  time,
  location,
  avatarUrl,
  onClick,
  className,
}: AppointmentCardProps) {
  return (
    <Card
      onClick={onClick}
      className={[
        "w-full text-left",
        "transition hover:bg-zinc-50 active:scale-[0.99]",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={petName}
              fill
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-sm font-semibold text-zinc-900">
            {petName}
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <LocationOn fontSize="small" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <AccessTime fontSize="small" />
            {time}
          </div>
        </div>
      </div>
    </Card>
  );
}
