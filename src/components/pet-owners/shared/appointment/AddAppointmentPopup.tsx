"use client";

import { useEffect, useMemo, useState } from "react";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import { LocationOn, Note as NoteIcon } from "@mui/icons-material";
import PetFilterSelector from "../PetFilterSelector";
import { PetLite } from "@/types/domain/pet";
import { AddAppointmentPayload } from "@/types/api/appointment.dto";

type AddCalendarAppointmentPopupProps = {
  open?: boolean;
  onClose: () => void;
  allPets: PetLite[];
  initialPetId?: number | null;
  initialDate?: string;
  onSubmit?: (data: AddAppointmentPayload) => void;
  triggerParam?: string;
  triggerValue?: string;
};

export default function AddAppointmentPopup({
  allPets,
  open,
  onClose,
  initialPetId,
  initialDate,
  onSubmit,
  triggerParam,
  triggerValue,
}: AddCalendarAppointmentPopupProps) {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Reset ข้อมูลเมื่อเปิด Popup */
  useEffect(() => {
    if (open) {
      setSelectedPetId(initialPetId || 0);
      setDate(initialDate || "");
      setTime("");
      setLocation("");
      setNote("");
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
        // Create date as UTC to prevent timezone shifting
        const [y, m, d] = date.split("-").map(Number);
        const [h, min] = time.split(":").map(Number);

        const appointmentDate = new Date(Date.UTC(y, m - 1, d, h, min));

        onSubmit({
          pet_id: Number(pet.pet_id),
          appointment_date: appointmentDate.toISOString(),
          location: location.trim(),
          note: note.trim(),
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
      triggerParam={triggerParam}
      triggerValue={triggerValue}
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
      <PetFilterSelector
        value={selectedPetId}
        pets={allPets}
        onChange={(val) => setSelectedPetId(Number(val))}
        allowAllPets={false}
        size={"40px"}
      />

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

      {/* 4. Note */}
      <div className="pt-2">
        <label className="block text-sm font-medium text-zinc-800 mb-1">
          Note
        </label>
        <div className="relative">
          <NoteIcon className="absolute left-3 top-2.5 text-zinc-400" fontSize="small" />
          <input
            type="text"
            placeholder="e.g. Any additional notes or instructions"
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </FormDialog>
  );
}