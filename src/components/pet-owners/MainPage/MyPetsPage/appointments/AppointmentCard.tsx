"use client";

import Image from "next/image";

export type AppointmentStatus = "upcoming" | "completed" | "canceled";

export type Appointment = {
  id: string;
  petName: string;
  date: string; // 17/12/2025
  time: string; // 11:00 A.M.
  location: string;
};

type AppointmentCardProps = {
  appointment: Appointment;
  onOpenDetail?: (id: string) => void;
};

const statusIconMap: Record<AppointmentStatus, string> = {
  upcoming: "/note.svg",
  completed: "/complete.svg",
  canceled: "/cancel.svg",
};

export default function AppointmentCard({
  appointment,
  onOpenDetail,
}: AppointmentCardProps) {
  const { id, petName, date, time, location } = appointment;

  return (
    <div className="relative rounded-2xl bg-white border border-zinc-100 shadow-sm p-4">
      {/* ID */}
      <div className="text-xs text-zinc-400">{`Id:${id}`}</div>

      {/* Main info */}
      <div className="mt-2 text-sm text-zinc-900 space-y-1 pr-10">
        <div>
          <span className="font-medium">Pet Name :</span> {petName}
        </div>
        <div>
          <span className="font-medium">Date :</span> {date}
        </div>
        <div>
          <span className="font-medium">Time :</span> {time}
        </div>
        <div className="truncate">
          <span className="font-medium">Location :</span> {location}
        </div>
      </div>

      {/* Right icon */}
      {onOpenDetail && (
        <button
          type="button"
          onClick={() => onOpenDetail(id)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          aria-label="Open appointment detail"
        >
          {/* <Image
            src={statusIconMap[status]}
            alt={status}
            width={22}
            height={22}
          /> */}
        </button>
      )}
    </div>
  );
}
