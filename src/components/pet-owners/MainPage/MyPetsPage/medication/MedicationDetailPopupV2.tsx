"use client";

import Image from "next/image";


type PetLite = {
  id: string;
  name: string;
  pid: string;
  avatarUrl?: string;
};

type MedicationRecordV2 = {
  id: string;
  medicationName: string;
  dose: string;
  times: string;
  note?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  pet: PetLite;
  record: MedicationRecordV2 | null;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function MedicationDetailPopupV2({
  open,
  onClose,
  pet,
  record,
  onEdit,
  onDelete,
}: Props) {
  if (!open || !record) return null;

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
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-lg border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-5 pb-4">
          <div className="text-center font-semibold text-zinc-900">Medication</div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-zinc-700 hover:text-zinc-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Petss row */}
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

        <div className="px-6 pb-6 space-y-4">
          <div>
            <div className="text-sm font-semibold text-zinc-800">Medicine Name</div>
            <div className="text-base text-zinc-900">{record.medicationName}</div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-zinc-800">Dose/Time</div>
              <div className="text-base text-zinc-900">{record.dose}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-800">Times/Day</div>
              <div className="text-base text-zinc-900">{record.times}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-zinc-800">Note</div>
            <div className="text-base text-zinc-900">{record.note ?? "-"}</div>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-2">
            <button
              type="button"
              onClick={onEdit}
              className="w-full rounded-full py-3 text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.99] transition shadow-sm"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-full rounded-full py-3 text-sm font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-[0.99] transition shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
