"use client";

import Image from "next/image";
import { LocationOn, AccessTime, CalendarToday } from "@mui/icons-material";
import Button from "@/components/pet-owners/shared/Button";

export type AppointmentDetailItem = {
  id: string;
  petId: string;
  petName: string;
  petPid: string;
  avatarUrl?: string;

  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  location: string;
  status?: string;
};

type Props = {
  open: boolean;
  appointment: AppointmentDetailItem | null;
  onClose: () => void;
  onEdit?: (appt: AppointmentDetailItem) => void;
  onDelete?: (id: string) => void;
  formatTime?: (t: string) => string;
};

function formatDateLabel(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function AppointmentDetail({
  open,
  appointment,
  onClose,
  onEdit,
  onDelete,
  formatTime,
}: Props) {
  if (!open || !appointment) return null;

  const dateText = formatDateLabel(appointment.date);
  const timeText = formatTime
    ? formatTime(appointment.time)
    : appointment.time;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[380px] rounded-2xl bg-white shadow-lg border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <div className="text-center font-semibold text-zinc-900">
            Appointment
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-zinc-700 hover:text-zinc-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Pet row */}
        <div className="px-5 pb-4 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100">
            {appointment.avatarUrl ? (
              <Image
                src={appointment.avatarUrl}
                alt={appointment.petName}
                fill
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {appointment.petName}
            </div>
            <div className="text-xs text-zinc-500 truncate">
              PID: {appointment.petPid}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 space-y-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-800">
            <div>
              <div className="flex items-center gap-1 font-medium">
                <CalendarToday fontSize="inherit" />
                Date
              </div>
              <div className="mt-1 text-zinc-700">{dateText}</div>
            </div>

            <div>
              <div className="flex items-center gap-1 font-medium">
                <AccessTime fontSize="inherit" />
                Time
              </div>
              <div className="mt-1 text-zinc-700">{timeText}</div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-zinc-800">
              <LocationOn fontSize="small" />
              Location
            </div>
            <div className="mt-1 text-sm text-zinc-700">
              {appointment.location}
            </div>
          </div>

          {/* Status */}
          {appointment.status ? (
            <div>
              <div className="text-sm font-medium text-zinc-800">
                Status
              </div>
              <div className="mt-1 text-sm text-zinc-700">
                {appointment.status}
              </div>
            </div>
          ) : null}

          {/* ✅ Actions (shared Button) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="primary"
              shape="pill"
              fullWidth
              onClick={() => onEdit?.(appointment)}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              shape="pill"
              fullWidth
              onClick={() => onDelete?.(appointment.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
