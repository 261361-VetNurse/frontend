/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from '@/components/shared/Image';
import type { PetLite } from "@/types/domain/pet";
import { getLocalDateString } from "@/utils/dateUtils";

export type AddMedicationPayloadV2 = {
  petId: number;
  medicationName: string;
  dose: string;
  times: string; // derived from reminders.length
  note: string;
};

type ReminderTime = {
  id: string;
  time: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: AddMedicationPayloadV2) => void;
  pet: PetLite;
};

export default function AddMedicationPopupV2({
  open,
  onClose,
  onSubmit,
  pet,
}: Props) {
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("everyday");
  const [startDate, setStartDate] = useState(
    getLocalDateString(new Date())
  );
  const [reminders, setReminders] = useState<ReminderTime[]>([
    { id: "r1", time: "08:00" },
  ]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setMedicationName("");
    setDosage("");
    setFrequency("everyday");
    setStartDate(getLocalDateString(new Date()));
    setReminders([{ id: "r1", time: "08:00" }]);
    setNote("");
  }, [open]);

  const canSubmit = useMemo(() => {
    return Boolean(
      pet?.pet_id &&
      medicationName.trim() &&
      dosage.trim() &&
      reminders.length > 0
    );
  }, [pet?.pet_id, medicationName, dosage, reminders]);

  if (!open) return null;

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function addReminder() {
    const id = `r${reminders.length + 1}`;
    setReminders([...reminders, { id, time: "08:00" }]);
  }

  function updateReminderTime(id: string, time: string) {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, time } : r))
    );
  }

  function removeReminder(id: string) {
    if (reminders.length === 1) return;
    setReminders(reminders.filter((r) => r.id !== id));
  }

  function handleSubmit() {
    if (!canSubmit) return;

    onSubmit?.({
      petId: pet.pet_id,
      medicationName: medicationName.trim(),
      dose: dosage.trim(),
      times: String(reminders.length),
      note: note.trim(),
    });

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-lg border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-5 pb-3">
          <div className="text-center font-semibold text-zinc-900">
            Create Medication
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

        {/* Pet (locked) */}
        <div className="px-6 pb-4 flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-100 shrink-0">
            {pet.profile_image ? (
              <Image
                src={pet.profile_image}
                alt={pet.name}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-zinc-900 truncate">
              {pet.name}
            </div>
            <div className="text-sm text-zinc-500 truncate">
              PID: {pet.pet_id}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Medicine name */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1">
              Medicine Name
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
          </div>

          {/* Dosage + Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1">
                Dosage
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-800 mb-1">
                Frequency
              </label>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="everyday">Everyday</option>
                <option value="twice_daily">Twice daily</option>
                <option value="three_times_daily">Three times daily</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Reminder times */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-800">
              Reminder Times
            </label>

            {reminders.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2">
                <span className="text-sm w-14">Time {i + 1}</span>
                <input
                  type="time"
                  className="flex-1 rounded-xl border border-zinc-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                  value={r.time}
                  onChange={(e) =>
                    updateReminderTime(r.id, e.target.value)
                  }
                />
                {reminders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReminder(r.id)}
                    className="text-red-500 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addReminder}
              className="text-sky-600 text-sm font-semibold"
            >
              + Add time
            </button>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-1">
              Note
            </label>
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 resize-vertical"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Submit */}
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
            Add New Medication
          </button>
        </div>
      </div>
    </div>
  );
}
