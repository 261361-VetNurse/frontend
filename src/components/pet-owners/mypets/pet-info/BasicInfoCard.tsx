"use client";

import InfoRow from "./InfoRow";

export default function BasicInfoCard({
  name,
  species,
  breed,
  birthDate,
  ageText,
  sex,
  color,
  previousClinic,
  onEdit,
}: {
  name: string;
  species?: string;
  breed?: string;
  birthDate: string;
  ageText: string;
  sex: string;
  color?: string;
  previousClinic?: string;
  onEdit?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 text-zinc-700">
            i
          </span>
          <div className="text-sm font-semibold text-zinc-900">
            Basic Information
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-sky-600 font-medium"
        >
          Edit
        </button>
      </div>

      <div className="mt-4">
        <InfoRow label="Name" value={name} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
        <InfoRow label="Species" value={species} />
        <InfoRow label="Breed" value={breed} />

        <InfoRow label="Date of birth" value={birthDate} />
        <InfoRow label="Age" value={ageText} />

        <InfoRow label="Sex" value={sex} />
        <InfoRow label="Color" value={color} />
      </div>

      <div className="mt-4">
        <InfoRow label="Previous clinic / hospital name" value={previousClinic} />
      </div>
    </div>
  );
}
