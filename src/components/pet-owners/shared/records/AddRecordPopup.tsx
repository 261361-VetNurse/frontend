"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from '@/components/shared/Image';
const Add = ({ fontSize, className }: { fontSize?: string; className?: string }) => (
  <Image src="/add-new.svg" alt="add" className={className} style={{ width: fontSize === 'small' ? 18 : 24, height: fontSize === 'small' ? 18 : 24 }} />
);
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import PetFilterSelector from "@/components/pet-owners/shared/PetFilterSelector";
import { uploadImage, authStorage } from "@/services/api/client";
import { PetLite } from "@/types/domain/pet";
import { AddSymptomPayload as AddSymptomPayloadDTO } from "@/types/api/record.dto";

type AddSymptomPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: AddSymptomPayloadDTO) => void;
  allPets: PetLite[];
  initialPetId?: number | null;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// 🔥 สร้าง ISO จาก local date + time โดยไม่เลื่อน timezone
function buildLocalISO(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  const local = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);

  return `${local.getFullYear()}-${pad2(local.getMonth() + 1)}-${pad2(
    local.getDate()
  )}T${pad2(local.getHours())}:${pad2(local.getMinutes())}:00`;
}

export default function AddSymptomPopup({
  open,
  onClose,
  onSubmit,
  allPets,
  initialPetId,
}: AddSymptomPopupProps) {
  const MAX_FILES = 4;

  const [selectedPetId, setSelectedPetId] = useState<number>(0);

  const pet = useMemo(() => {
    return allPets.find((p) => p.pet_id === selectedPetId);
  }, [allPets, selectedPetId]);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  function resetFileInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function cleanupPreviews(urls: string[]) {
    urls.forEach((u) => URL.revokeObjectURL(u));
  }

  useEffect(() => {
    if (open) {
      setSelectedPetId(initialPetId || 0);
      const today = new Date();
      const localDateIso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString();
      setDate(localDateIso.split('T')[0]);
      setTime(localDateIso.split('T')[1].substring(0, 5));
      setNote("");
      setFiles([]);
      setPreviews((prev) => {
        cleanupPreviews(prev);
        return [];
      });
      resetFileInput();
    }

    return () => {
      setPreviews((prev) => {
        cleanupPreviews(prev);
        return [];
      });
    };
  }, [open, initialPetId]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.pet_id && date && time && note.trim());
  }, [pet?.pet_id, date, time, note]);

  function onPickFiles(list: FileList | null) {
    if (!list) return;

    const picked = Array.from(list);

    setFiles((prevFiles) => {
      const combined = [...prevFiles, ...picked].slice(0, MAX_FILES);

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

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!pet) return; // narrow type: pet is defined when canSubmit is true

    setIsSubmitting(true);

    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      const imageUrls: string[] = [];

      if (files.length > 0) {
        const uploadPromises = files.map((file) =>
          uploadImage(file, token, "records")
        );

        const results = await Promise.all(uploadPromises);
        imageUrls.push(...results);
      }

      const dateTimeISO = buildLocalISO(date, time);
      void dateTimeISO; // used for reference; actual fields use date/time strings

      await onSubmit?.({
        pet_id: pet.pet_id,
        note: note.trim(),
        note_image: imageUrls,
        date_added: date,
        time_added: time,
      });

      onClose();
    } catch (err) {
      console.error("Failed to submit record:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Create Symptom Record"
      layout="singleColumn"
      density="compact"
      primaryLabel="Add New Record"
      onPrimary={handleSubmit}
      secondaryLabel="Cancel"
      onSecondary={onClose}
      submitting={isSubmitting}
      dirty={Boolean(date || time || note || files.length > 0)}
    >
      <PetFilterSelector
        value={selectedPetId}
        pets={allPets}
        onChange={(val) => setSelectedPetId(Number(val))}
        allowAllPets={false}
        size={"40px"}
      />
      {/* Date & Time */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-zinc-800">
          Record Time
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
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
            <label className="block text-xs text-zinc-500 mb-1">
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
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-zinc-800 mb-1">
          Note
        </label>
        <textarea
          className="w-full min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 resize-none"
          placeholder="Describe symptoms..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-800">
            Images ({files.length}/{MAX_FILES})
          </label>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={files.length >= MAX_FILES}
            className={`text-xs font-semibold flex items-center gap-1 py-1 px-2 rounded-lg transition-colors ${files.length < MAX_FILES
              ? "text-sky-600 hover:bg-sky-50"
              : "text-zinc-300"
              }`}
          >
            <Add fontSize="small" /> Add Photo
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

        <div className="grid grid-cols-2 gap-2">
          {files.map((_, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50"
            >
              {previews[idx] && (
                <Image
                  src={previews[idx]}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          ))}

          {files.length === 0 && (
            <div
              onClick={() => inputRef.current?.click()}
              className="col-span-2 py-6 border-2 border-dashed border-zinc-100 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 cursor-pointer"
            >
              <Add className="opacity-20 mb-1" />
              <span className="text-xs">No images selected</span>
            </div>
          )}
        </div>
      </div>
    </FormDialog >
  );
}