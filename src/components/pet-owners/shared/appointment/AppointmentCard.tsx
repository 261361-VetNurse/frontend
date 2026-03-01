"use client";

import { Card } from "@/components/ui/card";
import { LocationOn, CalendarToday } from "@mui/icons-material";
import type { Appointment } from "@/types/domain/appointment";
import Image from "next/image";

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
  const timeStr = appointment.appointment_time;

  return (
    <Card
      onClick={onClick}
      headerRight={timeStr}
      pillColor="bg-purple-400"
      className={["w-full text-left transition hover:bg-zinc-50 active:scale-[0.99]", className].join(" ")}
    >
      <div className="flex items-center gap-3">
        {/* Pet avatar */}
        {appointment.pet_image && (
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-100 shrink-0">
            <Image src={appointment.pet_image} alt={"pet image"} fill className="object-cover" />
          </div>
        )}
        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-zinc-900 leading-snug">
            {appointment.pet_name}
          </div>
          <div className="flex items-center font-light gap-1 mt-0.5 text-sm">
            <LocationOn sx={{ fontSize: 13 }} />
            <span className="truncate">{appointment.location} at {appointment.appointment_time}</span>
          </div>
        </div>

        {/* Calendar icon */}
        <CalendarToday sx={{ color: "#c0c4d4", fontSize: 38 }} className="shrink-0" />
      </div>
    </Card>
  );
}
