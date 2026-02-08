"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Add, KeyboardArrowDown, Check } from "@mui/icons-material";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import { getPresignedUrl, authStorage } from "@/services/api/client";
import type { PetLite } from "@/types/domain/pet";

export type AddSymptomPayload = {
  petId: string;
  date: string;
  time: string;
  note: string;
  images: string[];
};

type AddSymptomPopupProps = {
  open: boolean;
  onClose: () => void;
  pets: PetLite[]; // รับรายชื่อสัตว์เลี้ยงทั้งหมด
  initialPetId?: string; // รองรับค่าเริ่มต้น
  onSubmit?: (data: AddSymptomPayload) => void;
};

export default function AddRecordPopup({
  open,
  onClose,
  pets,
  initialPetId,
  onSubmit,
}: AddSymptomPopupProps) {
  const MAX_FILES = 4;

  const [selectedPetId, setSelectedPetId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // หาข้อมูลสัตว์เลี้ยงที่เลือก
  const selectedPet = useMemo(() =>
    pets.find(p => p._id === selectedPetId),
    [pets, selectedPetId]);

  function resetFileInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  function cleanupPreviews(urls: string[]) {
    urls.forEach((u) => URL.revokeObjectURL(u));
  }

  useEffect(() => {
    if (open) {
      setSelectedPetId(initialPetId || "");
      setDate("");
      setTime("");
      setNote("");
      setFiles([]);
      setIsSelectorOpen(false);
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
    return Boolean(selectedPetId && date && time && note.trim());
  }, [selectedPetId, date, time, note]);

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
    setIsSubmitting(true);
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      // Upload images
      const imageUrls: string[] = [];
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const { uploadUrl, publicUrl } = await getPresignedUrl(token, file.type, "symptom-record");
          await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });
          return publicUrl;
        });
        const results = await Promise.all(uploadPromises);
        imageUrls.push(...results);
      }

      await onSubmit?.({
        petId: selectedPetId,
        date,
        time,
        note: note.trim(),
        images: imageUrls,
      });
      onClose();
    } catch (err) {
      console.error("Failed to upload images or submit record:", err);
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
      dirty={Boolean(selectedPetId || date || time || note || files.length > 0)}
    >
      {/* 1. Custom Pet Selector */}
      <div className="space-y-1 pb-3 border-b border-zinc-100">
        <label className="block text-sm font-medium text-zinc-800">Select Pet</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="w-full flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden shrink-0">
              {selectedPet?.profile_image ? (
                <Image src={selectedPet.profile_image} alt="" width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-zinc-200" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              {selectedPet ? (
                <>
                  <div className="font-semibold text-zinc-900 truncate">{selectedPet.name}</div>
                  <div className="text-xs text-zinc-500 truncate">PID: {selectedPet._id}</div>
                </>
              ) : (
                <div className="text-zinc-400">Choose your pet</div>
              )}
            </div>
            <KeyboardArrowDown
              className={`text-zinc-400 transition-transform ${isSelectorOpen ? 'rotate-180' : ''}`}
              fontSize="small"
            />
          </button>

          {isSelectorOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-zinc-200 bg-white shadow-lg py-1">
              {pets.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => {
                    setSelectedPetId(p._id);
                    setIsSelectorOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden shrink-0">
                    {p.profile_image && <Image src={p.profile_image} alt="" width={40} height={40} className="object-cover" />}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-zinc-900 truncate">{p.name}</div>
                    <div className="text-xs text-zinc-500 truncate">PID: {p._id}</div>
                  </div>
                  {selectedPetId === p._id && <Check className="text-sky-500" fontSize="small" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Record Time */}
      <div className="space-y-1 pt-2">
        <div className="text-sm font-medium text-zinc-800">Record Time</div>
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

      {/* 3. Note */}
      <div>
        <label className="block text-sm font-medium text-zinc-800 mb-1">Note</label>
        <textarea
          className="w-full min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 resize-none"
          placeholder="Describe symptoms..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* 4. Images Section */}
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
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPickFiles(e.target.files)} />

        <div className="grid grid-cols-2 gap-2">
          {files.map((f, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50">
              {previews[idx] && <Image src={previews[idx]} alt="preview" fill className="object-cover" />}
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