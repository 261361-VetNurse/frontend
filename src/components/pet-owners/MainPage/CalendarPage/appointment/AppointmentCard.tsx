"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { Card } from "@/components/ui/card";
import { LocationOn, AccessTime } from "@mui/icons-material";
import type { Appointment } from "@/types/domain/appointment";
import Profile from "@/components/pet-owners/shared/Profile";

export type AppointmentCardProps = {
  appointment: Appointment;
  onClick?: () => void;
  className?: string;
};

export default function AppointmentCard({
  appointment,
  onClick,
  className,
}: AppointmentCardProps) {
  const dateObj = dayjs(appointment.appointment_date);
  const timeStr = appointment.appointment_time || dateObj.format("HH:mm");

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
        <Profile
          imageUrl={appointment.pet_image}
          alt={appointment.pet_name || "Pet"}
          size={"40px"}
          isPet={true}
        />

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-sm font-semibold text-zinc-900">
            {appointment.pet_name}
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <LocationOn fontSize="small" />
            <span className="truncate">{appointment.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <AccessTime fontSize="small" />
            {timeStr}
          </div>
        </div>
      </div>
    </Card>
  );
}

