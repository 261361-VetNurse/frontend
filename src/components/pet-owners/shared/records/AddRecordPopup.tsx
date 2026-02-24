"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Add } from "@mui/icons-material";
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

export default function AddSymptomPopup({
  open,
  onClose,
  onSubmit,
  allPets,
  initialPetId,
}: AddSymptomPopupProps) {
  const MAX_FILES = 4;

  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

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
    if (!canSubmit || !pet) return;
    setIsSubmitting(true);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      // Upload images
      const imageUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const publicUrl = await uploadImage(file, token, 'records');
          return publicUrl;
        });
        const results = await Promise.all(uploadPromises);
        imageUrls.push(...results);
      }

      await onSubmit?.({
        pet_id: Number(pet.pet_id),
        note: note.trim(),
        note_image: imageUrls, // Corrected field name to match DTO
        date_added: date,
        time_added: time,
      });
      onClose();
    } catch (err) {
      console.error("Failed to upload images or submit record:", err);
      // Optional: Add user notification here
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
        pets={allPets as any}
        onChange={(val) => setSelectedPetId(Number(val))}
        allowAllPets={false}
        size={"40px"}
      />

      {/* Date & Time - โครงสร้างแบบเดียวกับ Appointment */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-zinc-800">
          Record Time
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Date</label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Time</label>
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

      {/* Images Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-800">
            Images <span className="text-zinc-400 font-normal">({files.length}/{MAX_FILES})</span>
          </label>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={files.length >= MAX_FILES}
            className={`text-xs font-semibold flex items-center gap-1 py-1 px-2 rounded-lg transition-colors ${files.length < MAX_FILES ? "text-sky-600 hover:bg-sky-50" : "text-zinc-300"
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
          {files.map((f, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
              {previews[idx] ? (
                <Image
                  src={previews[idx]}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-zinc-200" />
              )}
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <div
              onClick={() => inputRef.current?.click()}
              className="col-span-2 py-6 border-2 border-dashed border-zinc-100 rounded-xl flex flex-col items-center justify-center text-zinc-400 hover:bg-zinc-50 cursor-pointer transition-colors"
            >
              <Add className="opacity-20 mb-1" />
              <span className="text-xs">No images selected</span>
            </div>
          )}
        </div>
      </div>
    </FormDialog>
  );
}