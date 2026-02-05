"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import { LocationOn, KeyboardArrowDown, Check } from "@mui/icons-material";
import type { PetLite } from "@/components/pet-owners/shared/PetFilterSelector";
import { exportICS } from "@/utils/exportICS";

export type AddAppointmentPayload = {
  petId: string;
  date: string;
  time: string;
  location: string;
};

type AddCalendarAppointmentPopupProps = {
  open: boolean;
  onClose: () => void;
  pets: PetLite[];         
  initialPetId?: string;   
  initialDate?: string; 
  onSubmit?: (data: AddAppointmentPayload) => void;
};

export default function AddAppointmentPopup({
  open,
  onClose,
  pets,
  initialPetId,
  initialDate,
  onSubmit,
}: AddCalendarAppointmentPopupProps) {
  const [selectedPetId, setSelectedPetId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // สถานะการเปิด/ปิด Dropdown สัตว์เลี้ยง
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // หาข้อมูลสัตว์เลี้ยงที่เลือกจาก ID
  const selectedPet = useMemo(() => 
    pets.find(p => p.id === selectedPetId), 
  [pets, selectedPetId]);

  /** Reset ข้อมูลเมื่อเปิด Popup */
  useEffect(() => {
    if (open) {
      setSelectedPetId(initialPetId || "");
      setDate(initialDate || "");
      setTime("");
      setLocation("");
      setIsSelectorOpen(false);
    }
  }, [open, initialPetId, initialDate]);

  const canSubmit = useMemo(() => {
    return Boolean(selectedPetId && date && time && location.trim());
  }, [selectedPetId, date, time, location]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const [h, m] = time.split(":").map(Number);
      const start = new Date(date);
      start.setHours(h, m, 0, 0);

      const end = new Date(start.getTime() + 30 * 60 * 1000);

      exportICS({
        title: `Appointment - ${selectedPet?.name}`,
        location: location.trim(),
        start,
        end,
      });

      await onSubmit?.({
        petId: selectedPetId,
        date,
        time,
        location: location.trim(),
      });

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title="Create Appointment"
      layout="singleColumn"
      density="compact"
      primaryLabel="Add New Appointment"
      onPrimary={handleSubmit}
      secondaryLabel="Cancel"
      onSecondary={onClose}
      submitting={isSubmitting}
      dirty={Boolean(selectedPetId || date || time || location)}
    >
      {/* 1. Custom Pet Selector (แสดงรูปและ PID เหมือนรูปขวา) */}
      <div className="space-y-1 pb-4 border-b border-zinc-100">
        <label className="block text-sm font-medium text-zinc-800">
          Select Pet
        </label>
        <div className="relative">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
            className="w-full flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden shrink-0">
              {selectedPet?.avatarUrl ? (
                <Image
                  src={selectedPet.avatarUrl}
                  alt={selectedPet.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-200 flex items-center justify-center text-[10px] text-zinc-400">
                  No Pic
                </div>
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              {selectedPet ? (
                <>
                  <div className="font-semibold text-zinc-900 truncate">{selectedPet.name}</div>
                  <div className="text-xs text-zinc-500 truncate">PID: {selectedPet.pid}</div>
                </>
              ) : (
                <div className="text-zinc-400">Choose your pet</div>
              )}
            </div>
            <KeyboardArrowDown 
              className={`text-zinc-400 transition-transform duration-200 ${isSelectorOpen ? 'rotate-180' : ''}`} 
              fontSize="small" 
            />
          </button>

          {/* Dropdown Menu */}
          {isSelectorOpen && (
            <div className="absolute z-[100] mt-2 w-full max-h-[240px] overflow-auto rounded-2xl border border-zinc-200 bg-white shadow-xl py-1">
              {pets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPetId(p.id);
                    setIsSelectorOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-sky-50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden shrink-0">
                    {p.avatarUrl && (
                      <Image src={p.avatarUrl} alt="" width={40} height={40} className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-zinc-900 truncate">{p.name}</div>
                    <div className="text-xs text-zinc-500 truncate">PID: {p.pid}</div>
                  </div>
                  {selectedPetId === p.id && (
                    <Check className="text-sky-500" fontSize="small" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Appointment Time */}
      <div className="space-y-1 pt-2">
        <div className="text-sm font-medium text-zinc-800">
          Appointment Time
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

      {/* 3. Location */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-zinc-800 mb-1">
          Location
        </label>
        <div className="relative">
          <LocationOn className="absolute left-3 top-2.5 text-zinc-400" fontSize="small" />
          <input
            type="text"
            placeholder="e.g. Examination Room"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
    </FormDialog>
  );
}