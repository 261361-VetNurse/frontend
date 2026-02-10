"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FormDialog } from "@/components/pet-owners/shared/FormDialog";
import { PetLite } from "@/types/domain/pet";

type AddAppointmentPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    petId: string;
    date: string;
    time: string;
    location: string;
  }) => void;
  pet: PetLite;
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

  useEffect(() => {
    if (open) {
      setDate("");
      setTime("");
      setLocation("");
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    return Boolean(pet?.pet_id && date && time && location.trim());
  }, [pet?.pet_id, date, time, location]);

  /* Added logging for debugging */
  const handleSubmit = () => {
    console.log("handleSubmit called. State:")
    // console.log("handleSubmit called. State:", {
    //   canSubmit,
    //   petId: pet?.pet_id,
    //   date,
    //   time,
    //   location,
    //   propsPet: pet,
    // });

    // if (!canSubmit) {
    //   console.warn("Validation failed: All fields are required.");
    //   alert("Please fill in all fields (Date, Time, Location).");
    //   return;
    // }

    // if (onSubmit) {
    //   onSubmit({
    //     petId: pet.pet_id,
    //     date,
    //     time,
    //     location: location.trim(),
    //   });
    // }

    // onClose();
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
      dirty={canSubmit}
    >
      {/* Pet info */}
      <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
        <div className="h-10 w-10 rounded-full bg-zinc-100 overflow-hidden shrink-0">
          {pet.profile_image ? (
            <Image
              src={pet.profile_image}
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
            PID: {pet.pet_id}
          </div>
        </div>
      </div>

      {/* Appointment time */}
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
        <input
          type="text"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Examination Room 1"
        />
      </div>
    </FormDialog>
  );
}
