"use client";

import Image from "next/image";

export type SymptomDetailRecord = {
  id: string;
  petId: string;
  petName: string;
  petPid: string;
  avatarUrl?: string;

  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  note: string;

  imageUrls?: string[];
};

type Props = {
  open: boolean;
  record: SymptomDetailRecord | null;
  onClose: () => void;
  onEdit?: (rec: SymptomDetailRecord) => void;
  onDelete?: (id: string) => void;

  // ✅ เพิ่มเพื่อให้ page.tsx ส่งมาได้
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

export default function SymptomDetailPopup({
  open,
  record,
  onClose,
  onEdit,
  onDelete,
  formatTime,
}: Props) {
  if (!open || !record) return null;

  const timeText = formatTime ? formatTime(record.time) : record.time;
  const dateText = formatDateLabel(record.date);
  const images = record.imageUrls ?? [];

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
          <div className="text-center font-semibold text-zinc-900">Record</div>

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
        <div className="px-5 pb-4 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-100">
            {record.avatarUrl ? (
              <Image
                src={record.avatarUrl}
                alt={record.petName}
                fill
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {record.petName}
            </div>
            <div className="text-xs text-zinc-500 truncate">{`PID: ${record.petPid}`}</div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 space-y-4">
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-800">
            <div>
              <div className="font-medium">Date</div>
              <div className="mt-1 text-zinc-700">{dateText}</div>
            </div>
            <div>
              <div className="font-medium">Time</div>
              <div className="mt-1 text-zinc-700">{timeText}</div>
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="text-sm font-medium text-zinc-800">Note</div>
            <div className="mt-1 text-sm text-zinc-700 whitespace-pre-wrap">
              {record.note}
            </div>
          </div>

          {/* Images */}
          <div>
            <div className="text-sm font-medium text-zinc-800">Image</div>

            {images.length === 0 ? (
              <div className="mt-2 text-sm text-zinc-400">No images</div>
            ) : (
              <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
                {images.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative h-40 w-40 shrink-0 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200"
                  >
                    <Image
                      src={url}
                      alt={`img-${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => onEdit?.(record)}
              className="w-full rounded-full py-3 text-sm font-semibold bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.99] transition"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(record.id)}
              className="w-full rounded-full py-3 text-sm font-semibold bg-red-500 text-white hover:bg-red-600 active:scale-[0.99] transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
