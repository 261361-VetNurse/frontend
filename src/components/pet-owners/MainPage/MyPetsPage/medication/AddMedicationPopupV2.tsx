"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export type PetLite = {
  id: string;
  name: string;
  pid: string;
  avatarUrl?: string;
};

export type AddMedicationPayloadV2 = {
  petId: string;
  medicationName: string;
  dose: string;
  times: string;
  note: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: AddMedicationPayloadV2) => void;
  pet: PetLite; 
};

export default function AddMedicationPopupV2({ open, onClose, onSubmit, pet }: Props) {
  const [medicationName, setMedicationName] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setMedicationName("");
    setDose("");
    setTimes("");
    setNote("");
  }, [open]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.id && medicationName.trim() && dose.trim() && times.trim());
  }, [pet?.id, medicationName, dose, times]);

  if (!open) return null;

  function handleClose() {
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClose();
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit?.({
      petId: pet.id,
      medicationName: medicationName.trim(),
      dose: dose.trim(),
      times: times.trim(),
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
        <div className="relative px-6 pt-5 pb-3">
          <div className="text-center font-semibold text-zinc-900">Create Medication</div>
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-zinc-700 hover:text-zinc-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Pet row (locked) */}
        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-100 shrink-0">
            {pet.avatarUrl ? (
              <Image src={pet.avatarUrl} alt={pet.name} fill className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-zinc-900 truncate">{pet.name}</div>
            <div className="text-sm text-zinc-500 truncate">{`PID: ${pet.pid}`}</div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1">Medicine Name</label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1">Dose/Time</label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1">Times/Day</label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={times}
                onChange={(e) => setTimes(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1">Note</label>
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 resize-vertical"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

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
            Add New Medication
          </button>
        </div>
      </div>
    </div>
  );
}
