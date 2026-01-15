"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import { LocationOn } from "@mui/icons-material";
import type { PetLite } from "@/components/pet-owners/shared/PetFilterSelector";


export type AddAppointmentPayload = {
  petId: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:mm
  location: string;
};

type AddAppointmentPopupProps = {
  open: boolean;
  onClose: () => void;
  pets: PetLite[];
initialPetId?: string;

  onSubmit?: (data: AddAppointmentPayload) => void;
  pet?: PetLite;              // optional (ถ้ามาจาก calendar ที่เลือก pet แล้ว)
};

export default function AddAppointmentPopup({
  open,
  onClose,
  onSubmit,
  pet,
}: AddAppointmentPopupProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** reset เมื่อเปิด popup */
  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setLocation("");
    }
  }, [open, pet?.id]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.id && date && time && location.trim());
  }, [pet?.id, date, time, location]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.({
        petId: pet!.id,
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
      dirty={Boolean(date || time || location)}
    >
      {/* Pet info (เหมือน Record) */}
      {pet ? (
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
          <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden shrink-0">
            {pet.avatarUrl ? (
              <Image
                src={pet.avatarUrl}
                alt={pet.name}
                width={40}
                height={40}
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900 truncate">
              {pet.name}
            </div>
            <div className="text-xs text-zinc-500 truncate">
              PID: {pet.pid}
            </div>
          </div>
        </div>
      ) : null}

      {/* Date & Time */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-zinc-800">
          Appointment Time
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

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-zinc-800 mb-1">
          Location
        </label>
        <div className="relative">
          <LocationOn className="absolute left-3 top-2.5 text-zinc-400" fontSize="small" />
          <input
            type="text"
            placeholder="Enter location"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>
    </FormDialog>
  );
}
