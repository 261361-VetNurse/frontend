"use client";

import dayjs from "dayjs";
import { LocationOn, AccessTime, CalendarToday, Note } from "@mui/icons-material";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import type { Appointment } from "@/types/domain/appointment";
import Profile from "../Profile";
import Button from "@/components/pet-owners/shared/Button";

type Props = {
  open?: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit?: (appt: Appointment) => void;
  onDelete?: (id: number) => void;
  onAddToCalendar?: (appt: Appointment, type: "google" | "local") => void;
  triggerParam?: string;
  triggerValue?: string;
};

export default function AppointmentDetail({
  open,
  appointment,
  onClose,
  onEdit,
  onDelete,
  triggerParam,
  triggerValue,
  onAddToCalendar,
}: Props) {
  if (!open || !appointment) return null;

  const dateObj = dayjs(appointment.appointment_date);
  const dateText = dateObj.format("DD/MM/YYYY");
  const timeText = appointment.appointment_time
    ? appointment.appointment_time.slice(0, 5)
    : dateObj.format("HH:mm");

  // Extract only the date part (YYYY-MM-DD) in case appointment_date is a full ISO string
  const datePart = dayjs(appointment.appointment_date).format("YYYY-MM-DD");
  const isPast = dayjs(`${datePart}T${timeText}`).isBefore(dayjs());
  const displayStatus = (appointment.status === "Upcoming" && isPast) ? "Completed" : appointment.status;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      triggerParam={triggerParam}
      triggerValue={triggerValue}
      title="Appointment"
      layout="singleColumn"
      density="compact"
      primaryLabel="Edit"
      onPrimary={() => onEdit?.(appointment)}
      secondaryLabel="Delete"
      onSecondary={() => onDelete?.(appointment.appointment_id)}
    >
      {/* Pet row */}
      <div className="flex flex-row items-center gap-3 pb-4 border-b border-zinc-100 w-full">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100 shrink-0">
          <Profile
            imageUrl={appointment.pet_image}
            alt={appointment.pet_name}
            size={50}
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
      <div className="space-y-4 pt-2 w-full">
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

        {/* Note */}
        {appointment.note ? (
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-zinc-800">
              <Note fontSize="small" />
              Note
            </div>
            <div className="mt-1 text-sm text-zinc-700">
              {appointment.note}
            </div>
          </div>
        ) : null}

        {/* Status */}
        {displayStatus ? (
          <div>
            <div className="text-sm font-medium text-zinc-800">
              Status
            </div>
            <div className="mt-1 text-sm text-zinc-700">
              {displayStatus}
            </div>
          </div>
        ) : null}

        {/* Add to Calendar */}
        {onAddToCalendar && (
          <div className="pt-2">
            <div className="text-sm font-medium text-zinc-800 mb-2">
              Add to Calendar
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="secondary"
                shape="pill"
                fullWidth
                onClick={() => onAddToCalendar(appointment, "local")}
              >
                Add to Calendar
              </Button>
            </div>
          </div>
        )}
      </div>
    </FormDialog >
  );
}

