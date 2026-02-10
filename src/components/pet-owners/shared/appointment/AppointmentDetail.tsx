"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { LocationOn, AccessTime, CalendarToday } from "@mui/icons-material";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import type { Appointment } from "@/types/domain/appointment";
import Profile from "../Profile";

type Props = {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit?: (appt: Appointment) => void;
  onDelete?: (id: number) => void;
};

export default function AppointmentDetail({
  open,
  appointment,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!open || !appointment) return null;

  const dateObj = dayjs(appointment.appointment_date);
  const dateText = dateObj.format("DD/MM/YYYY");
  const timeText = dateObj.format("HH:mm");

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Appointment"
      layout="singleColumn"
      density="compact"
      primaryLabel="Edit"
      onPrimary={() => onEdit?.(appointment)}
      secondaryLabel="Delete"
      onSecondary={() => onDelete?.(appointment.appointment_id)}
    >
      {/* Pet row */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100 shrink-0">
          <Profile
            imageUrl={appointment.pet_image}
            alt={appointment.pet_name}
            size="small"
          />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">
            {appointment.pet_name}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            PID: {appointment.pet_id}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 pt-2">
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
      </div>
    </FormDialog>
  );
}

