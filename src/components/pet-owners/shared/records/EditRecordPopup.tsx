"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { uploadImage, authStorage } from "@/services/api/client";
import type { RecordDetailItem } from "./RecordDetailPopup";

export type EditSymptomPayload = {
  id: string;
  petId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  note: string;
  existingImages: string[];
  newImages: string[];
};

type Props = {
  open: boolean;
  record: RecordDetailItem | null;
  onClose: () => void;
  onSave?: (data: EditSymptomPayload) => void;
  maxImages?: number; // default 4
};

export default function EditRecordPopup({
  open,
  record,
  onClose,
  onSave,
  maxImages = 4,
}: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");

  // Separate existing images from new files
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || !record) return;

    setDate(record.date ?? "");
    setTime(record.time ?? "");
    setNote(record.note ?? "");

    setExistingImages(record.imageUrls ?? []);
    setNewFiles([]);

    // Clear old previews
    setNewPreviews(prev => {
      prev.forEach(u => URL.revokeObjectURL(u));
      return [];
    });

    if (fileRef.current) fileRef.current.value = "";

    return () => {
      // cleanup on unmount or close? 
      // We'll clean up previews in the next effect or when unmounting
    };
  }, [open, record?.id]);

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      newPreviews.forEach(u => URL.revokeObjectURL(u));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canSubmit = useMemo(() => {
    return Boolean(record?.id && date && time && note.trim());
  }, [record?.id, date, time, note]);

  // guard
  if (!open || !record) return null;

  const r = record;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handlePickFiles(list: FileList | null) {
    if (!list) return;

    const currentTotal = existingImages.length + newFiles.length;
    const remain = Math.max(0, maxImages - currentTotal);

    if (remain <= 0) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const picked = Array.from(list).slice(0, remain);
    const urls = picked.map((f) => URL.createObjectURL(f));

    setNewFiles((prev) => [...prev, ...picked]);
    setNewPreviews((prev) => [...prev, ...urls]);

    if (fileRef.current) fileRef.current.value = "";
  }

  function removeExistingImage(idx: number) {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  }

  function removeNewFile(idx: number) {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSave() {
    if (!canSubmit) return;

    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      // Upload new images
      const newImageUrls: string[] = [];
      if (newFiles.length > 0) {
        const uploadPromises = newFiles.map(async (file) => {
          const publicUrl = await uploadImage(file, token);
          return publicUrl;
        });
        const results = await Promise.all(uploadPromises);
        newImageUrls.push(...results);
      }

      onSave?.({
        id: r.id,
        petId: r.petId,
        date,
        time,
        note: note.trim(),
        existingImages,
        newImages: newImageUrls,
      });

      onClose();
    } catch (err) {
      console.error("Failed to upload images or save record:", err);
    }
  }

  const currentCount = existingImages.length + newFiles.length;
  const canAddMore = currentCount < maxImages;

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
            Edit Record
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
            {r.avatarUrl ? (
              <Image
                src={r.avatarUrl}
                alt={r.petName}
                fill
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {r.petName}
            </div>
            <div className="text-xs text-zinc-500 truncate">{`PID: ${r.petPid}`}</div>
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
            />
          </div>

          {/* Images */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-zinc-800">
                Image
              </label>

              <button
                type="button"
                onClick={() => canAddMore && fileRef.current?.click()}
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
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePickFiles(e.target.files)}
            />

            <div className="mt-2 grid grid-cols-2 gap-3">
              {/* Existing Images */}
              {existingImages.map((url, idx) => (
                <div
                  key={`existing-${url}-${idx}`}
                  className="relative aspect-square rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200"
                >
                  <Image
                    src={url}
                    alt={`img-${idx + 1}`}
                    fill
                    className="object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white/90 text-zinc-700 shadow flex items-center justify-center hover:bg-white"
                    aria-label="Remove image"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* New Images */}
              {newPreviews.map((url, idx) => (
                <div
                  key={`new-${url}-${idx}`}
                  className="relative aspect-square rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200"
                >
                  <Image
                    src={url}
                    alt={`new-img-${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0 left-0 bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg">
                    New
                  </div>

                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute right-2 top-2 h-7 w-7 rounded-full bg-white/90 text-zinc-700 shadow flex items-center justify-center hover:bg-white"
                    aria-label="Remove image"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {canAddMore && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-3xl text-zinc-500 hover:bg-zinc-50"
                  aria-label="Add image"
                >
                  +
                </button>
              )}
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              {currentCount}/{maxImages} images
            </div>
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
