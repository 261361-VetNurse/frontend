"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type PetLite = {
  id: string;
  name: string;
  pid: string;
  avatarUrl?: string;
};

type AddAppointmentPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    petId: string;
    date: string;
    time: string;
    location: string;
  }) => void;
  pet: PetLite;
};

export default function AddAppointmentPopup({
  open,
  onClose,
  onSubmit,
  pet,
}: AddAppointmentPopupProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setLocation("");
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.id && date && time && location.trim());
  }, [pet?.id, date, time, location]);

  if (!open) return null;

  function handleClose() {
    setDate("");
    setTime("");
    setLocation("");
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClose();
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit?.({
      petId: pet.id,
      date,
      time,
      location: location.trim(),
    });

    handleClose();
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[360px] rounded-2xl bg-white shadow-lg border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="relative px-5 pt-5 pb-3">
          <div className="text-center font-semibold text-zinc-900">
            Create Appointment
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-zinc-700 hover:text-zinc-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Petss row */}
        <div className="px-5 pb-4 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100">
            {pet.avatarUrl ? (
              <Image
                src={pet.avatarUrl}
                alt={pet.name}
                fill
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {pet.name}
            </div>
            <div className="text-xs text-zinc-500 truncate">{`PID: ${pet.pid}`}</div>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Date */}
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

            {/* Time */}
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder=""
            />
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              "w-full rounded-full py-3 text-sm font-semibold transition shadow-sm",
              canSubmit
                ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.99]"
                : "bg-zinc-200 text-zinc-500 cursor-not-allowed",
            ].join(" ")}
          >
            Add New Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
