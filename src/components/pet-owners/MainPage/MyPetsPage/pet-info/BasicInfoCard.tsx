"use client";

import dayjs from "dayjs";
import InfoRow from "./InfoRow";

export default function BasicInfoCard({
  name,
  species,
  breed,
  birthDate,
  ageText,
  sex,
  weightKg,
  infecund,
  allergies,
  inMedical,
  onEdit,
}: {
  name: string;
  species?: string;
  breed?: string;
  birthDate: string;
  ageText: string;
  sex: string;
  weightKg?: string | null;
  infecund?: boolean;
  allergies?: string[];
  inMedical?: boolean;
  onEdit?: () => void;
}) {
  const sterileText = infecund ? "Yes" : "No";

  const allergiesText =
    allergies && allergies.length > 0 ? allergies.join(", ") : "-";

  const formattedBirthDate = birthDate
    ? dayjs(birthDate).format("DD/MM/YYYY")
    : "-";

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* info icon */}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full ">
            <img
              src="/info.svg"
              alt=""
              className="h-4 w-4"
            />
          </span>

          <div className="text-sm font-semibold text-zinc-900">
            Basic Information
          </div>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-sm text-sky-600 font-medium underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* Grid Section */}
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="col-span-2">
          <InfoRow label="Name" value={name} />
        </div>
        <InfoRow label="Species" value={species} />
        <InfoRow label="Breed" value={breed} />
        <InfoRow label="Infecund" value={sterileText} />
        <InfoRow label="Date of birth" value={formattedBirthDate} />
        <InfoRow label="Age" value={ageText} />
        <InfoRow label="Gender" value={sex} />
        <InfoRow label="Weight (kg)" value={weightKg ?? "-"} />
        <InfoRow label="In Medical" value={inMedical ? "Yes" : "No"} />
        <div className="col-span-2">
          <InfoRow label="Allergies" value={allergiesText} />
        </div>
      </div>
    </div>
  );
}
