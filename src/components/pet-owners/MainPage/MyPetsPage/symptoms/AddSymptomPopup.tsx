"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type PetLite = {
  id: string;
  name: string;
  pid: string;
  avatarUrl?: string;
};

export type AddSymptomPayload = {
  petId: string;
  date: string;
  time: string;
  note: string;
  images: File[];
};

export function SymptomFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-6 h-14 w-14 rounded-full bg-sky-500 text-white text-3xl leading-none shadow-lg active:scale-[0.98] transition z-[900]"
      aria-label="Add symptom record"
    >
      +
    </button>
  );
}

type AddSymptomPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: AddSymptomPayload) => void;
  pet: PetLite;
};

export default function AddSymptomPopup({
  open,
  onClose,
  onSubmit,
  pet,
}: AddSymptomPopupProps) {
  const MAX_FILES = 4;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  function resetFileInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function cleanupPreviews(urls: string[]) {
    urls.forEach((u) => URL.revokeObjectURL(u));
  }

  useEffect(() => {
    if (open) {
      // reset form
      setDate("");
      setTime("");
      setNote("");

      // cleanup & reset files/previews
      setFiles([]);
      setPreviews((prev) => {
        cleanupPreviews(prev);
        return [];
      });

      resetFileInput();
    } else {
      setPreviews((prev) => {
        cleanupPreviews(prev);
        return [];
      });
    }

    // cleanup on unmount
    return () => {
      setPreviews((prev) => {
        cleanupPreviews(prev);
        return [];
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pet?.id]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.id && date && time && note.trim());
  }, [pet?.id, date, time, note]);

  const canAddMore = files.length < MAX_FILES;

  if (!open) return null;

  function handleClose() {
    setDate("");
    setTime("");
    setNote("");
    setFiles([]);
    setPreviews((prev) => {
      cleanupPreviews(prev);
      return [];
    });
    resetFileInput();
    onClose();
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) handleClose();
  }

  function onPickFiles(list: FileList | null) {
    if (!list) return;

    const picked = Array.from(list);
    if (picked.length === 0) return;

    setFiles((prevFiles) => {
      const combined = [...prevFiles, ...picked].slice(0, MAX_FILES);

      // keep previews in sync with files
      setPreviews((prevPrev) => {
        cleanupPreviews(prevPrev);
        return combined.map((f) => URL.createObjectURL(f));
      });

      return combined;
    });

    resetFileInput();
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit?.({
      petId: pet.id,
      date,
      time,
      note: note.trim(),
      images: files,
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
            Create Symptom Record
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

        {/* Pet row */}
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

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Note
            </label>
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 resize-y"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder=""
            />
          </div>

          {/* Images (optional) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-800">
                Images (optional)
                <span className="ml-2 text-xs text-zinc-400">
                  ({files.length}/{MAX_FILES})
                </span>
              </label>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={!canAddMore}
                className={[
                  "text-sm",
                  canAddMore
                    ? "text-sky-600 hover:text-sky-700"
                    : "text-zinc-300 cursor-not-allowed",
                ].join(" ")}
              >
                Add
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPickFiles(e.target.files)}
            />

            {files.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                  >
                    <Image
                      src={previews[idx]}
                      alt={f.name}
                      fill
                      className="object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-white text-sm leading-none flex items-center justify-center hover:bg-black/70"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-zinc-400">No images selected</div>
            )}
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
            Add New Record
          </button>
        </div>
      </div>
    </div>
  );
}
