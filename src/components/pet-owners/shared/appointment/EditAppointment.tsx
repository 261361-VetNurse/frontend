/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import type { Appointment } from "@/types/domain/appointment";
import Profile from "@/components/pet-owners/shared/Profile";

type Props = {
  open?: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSave?: (data: Appointment) => void;
  onCancelAppointment?: (id: number) => void;
  triggerParam?: string;
  triggerValue?: string;
};

export default function EditAppointment({
  open,
  appointment,
  onClose,
  onSave,
  onCancelAppointment,
  triggerParam,
  triggerValue,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !appointment) return;

    const dateObj = dayjs(appointment.appointment_date);
    setDate(dateObj.format("YYYY-MM-DD"));
    setTime(dateObj.format("HH:mm"));
    setLocation(appointment.location ?? "");
    setNote(appointment.note ?? "");
  }, [open, appointment]);

  const canSubmit = useMemo(() => {
    return Boolean(
      appointment?.appointment_id &&
      date &&
      time &&
      location.trim()
    );
  }, [appointment?.appointment_id, date, time, location]);

  // guard
  if (!open || !appointment) return null;

  const a = appointment;

  function handleSave() {
    if (!canSubmit) {
      alert("The data filed not valid");
      return
    };

    if (onSave) {
      try {
        // Send Thai time directly with +07:00 offset — backend stores as-is
        const appointmentDate = `${date}T${time}:00+07:00`;

        onSave({
          appointment_id: a.appointment_id,
          pet_id: Number(a.pet_id),
          appointment_date: appointmentDate,
          location: location.trim(),
          note: note.trim(),
          status: "Upcoming"
        });
        onClose();
      } catch (error) {
        console.error("Failed to submit appointment:", error);
      }
    }
  }

  function handleCancel() {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      onCancelAppointment?.(a.appointment_id);
      onClose();
    }
  }

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      triggerParam={triggerParam}
      triggerValue={triggerValue}
      title="Edit Appointment"
      layout="singleColumn"
      density="compact"
      primaryLabel="Save"
      onPrimary={handleSave}
      secondaryLabel="Cancel Appointment"
      onSecondary={handleCancel}
      dirty={canSubmit}
    >
      {/* Pet row */}
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100 shrink-0">
          <Profile
            imageUrl={a.pet_image}
            alt={a.pet_name}
            size="sm"
          />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 truncate">
            {a.pet_name}
          </div>
          <div className="text-xs text-zinc-500 truncate">
            PID: {a.pet_id}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4 pt-2">
        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Time
            </label>
            <input
              type="time"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-zinc-800 mb-1">
            Location
          </label>
          <input
            type="text"
            placeholder="Enter location"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-zinc-800 mb-1">
            Note
          </label>
          <input
            type="text"
            placeholder="Enter note"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </FormDialog>
  );
}

