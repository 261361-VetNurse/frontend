"use client";

import { useEffect, useMemo, useState } from "react";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import { LocationOn } from "@mui/icons-material";
import PetFilterSelector from "../PetFilterSelector";
import { PetLite } from "@/types/domain/pet";
import { AddAppointmentPayload } from "@/types/api/appointment.dto";

type AddCalendarAppointmentPopupProps = {
  open: boolean;
  onClose: () => void;
  allPets: PetLite[];
  initialPetId?: number | null;
  initialDate?: string;
  onSubmit?: (data: AddAppointmentPayload) => void;
};

export default function AddAppointmentPopup({
  allPets,
  open,
  onClose,
  initialPetId,
  initialDate,
  onSubmit,
}: AddCalendarAppointmentPopupProps) {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Reset ข้อมูลเมื่อเปิด Popup */
  useEffect(() => {
    if (open) {
      setSelectedPetId(initialPetId || 0);
      setDate(initialDate || "");
      setTime("");
      setLocation("");
    }
  }, [open, initialPetId, initialDate]);

  const pet = useMemo(() => {
    return allPets.find((p) => p.pet_id === selectedPetId);
  }, [allPets, selectedPetId]);

  const canSubmit = useMemo(() => {
    return Boolean(pet && date && time && location.trim());
  }, [pet, date, time, location]);

  const handleSubmit = () => {
    if (!canSubmit) {
      console.warn("Validation failed: All fields are required.");
      alert("Please fill in all fields (Date, Time, Location).");
      return;
    }

    if (onSubmit && pet) {
      setIsSubmitting(true);
      try {
        // Combine date and time into ISO string
        const appointmentDate = new Date(`${date}T${time}:00`).toISOString();

        onSubmit({
          pet_id: Number(pet.pet_id),
          appointment_date: appointmentDate,
          location: location.trim(),
          status: "Upcoming"
        });
        onClose();
      } catch (error) {
        console.error("Failed to submit appointment:", error);
      } finally {
        setIsSubmitting(false);
      }
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
        <PetFilterSelector
          value={selectedPetId}
          pets={allPets}
          onChange={setSelectedPetId}
          allowAllPets={true}
          size="md"
        />
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