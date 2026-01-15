"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { AppointmentDetailItem } from "./AppointmentDetail";

export type EditAppointmentPayload = {
  id: string;
  petId: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:mm
  location: string;
  status?: string;
};

type Props = {
  open: boolean;
  appointment: AppointmentDetailItem | null;
  onClose: () => void;
  onSave?: (data: EditAppointmentPayload) => void;
};

export default function EditAppointment({
  open,
  appointment,
  onClose,
  onSave,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open || !appointment) return;

    setDate(appointment.date ?? "");
    setTime(appointment.time ?? "");
    setLocation(appointment.location ?? "");
    setStatus(appointment.status);
  }, [open, appointment?.id]);

  const canSubmit = useMemo(() => {
    return Boolean(
      appointment?.id &&
        date &&
        time &&
        location.trim()
    );
  }, [appointment?.id, date, time, location]);

  // guard
  if (!open || !appointment) return null;

  const a = appointment;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSave() {
    if (!canSubmit) return;

    onSave?.({
      id: a.id,
      petId: a.petId,
      date,
      time,
      location: location.trim(),
      status,
    });

    onClose();
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
            Edit Appointment
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
            {a.avatarUrl ? (
              <Image
                src={a.avatarUrl}
                alt={a.petName}
                fill
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {a.petName}
            </div>
            <div className="text-xs text-zinc-500 truncate">
              PID: {a.petPid}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 pb-5 space-y-4">
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

          {/* Status (optional) */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Status
            </label>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={status ?? ""}
              onChange={(e) =>
                setStatus(e.target.value || undefined)
              }
            >
              <option value="">—</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSubmit}
            className={[
              "w-full rounded-full py-3 text-sm font-semibold transition shadow-sm",
              canSubmit
                ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.99]"
                : "bg-zinc-200 text-zinc-500 cursor-not-allowed",
            ].join(" ")}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
