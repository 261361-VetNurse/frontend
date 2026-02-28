/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { QuickDialButton } from "@/components/shared";

type PetLite = {
  id: string;
  name: string;
  pid: string;
  avatarUrl?: string;
};

export type AddMedicalPayload = {
  petId: string;
  date: string; // YYYY-MM-DD
  time: string;
  note: string;
};

export function MedicalFab({ onClick }: { onClick: () => void }) {
  return (
    <QuickDialButton
      iconColor="#fff"
      position="bottom-right"
      icon={<AddRoundedIcon />}
      color="#09BFF8"
      onClickAction={onClick}
    />
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: AddMedicalPayload) => void;
  pet: PetLite;
};

export default function AddMedicalPopup({
  open,
  onClose,
  onSubmit,
  pet,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setDate("");
    setTime("");
    setNote("");
  }, [open, pet?.id]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.id && date && time && note.trim());
  }, [pet?.id, date, time, note]);

  if (!open) return null;

  function handleClose() {
    setDate("");
    setTime("");
    setNote("");
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
      note: note.trim(),
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
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-lg border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="text-center font-semibold text-zinc-900 text-xl">
            Create Medical
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
        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100 shrink-0">
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
            <div className="text-base font-semibold text-zinc-900 truncate">
              {pet.name}
            </div>
            <div className="text-sm text-zinc-600 truncate">{`PID: ${pet.pid}`}</div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xl font-semibold text-zinc-900 mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xl font-semibold text-zinc-900 mb-2">
                Time
              </label>
              <input
                type="time"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xl font-semibold text-zinc-900 mb-2">
              Note
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder=""
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={[
              "w-full rounded-full py-4 text-base font-semibold transition shadow-sm",
              canSubmit
                ? "bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.99]"
                : "bg-zinc-200 text-zinc-500 cursor-not-allowed",
            ].join(" ")}
          >
            Add Medical
          </button>
        </div>
      </div>
    </div>
  );
}
