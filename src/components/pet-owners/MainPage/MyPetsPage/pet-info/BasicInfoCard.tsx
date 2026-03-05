"use client";

import dayjs from "dayjs";
import Image from "next/image";
import InfoRow from "./InfoRow";
import { Pet } from "@/types/domain/pet";
import { formatAge } from "@/lib/pets/age";

export default function BasicInfoCard({
  petInfo,
  onEdit,
}: {
  petInfo: Pet;
  onEdit?: () => void;
}) {
  const sterileText = petInfo.infecund ? "Yes" : "No";

  const formattedBirthDate = petInfo.birth_date
    ? dayjs(petInfo.birth_date).format("DD/MM/YYYY")
    : "-";

  const ageText = formatAge(petInfo.birth_date || "");

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* info icon */}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full ">
            <Image
              src="/info.svg"
              alt=""
              width={16}
              height={16}
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
          <InfoRow label="Name" value={petInfo.name} />
        </div>
        <InfoRow label="Species" value={petInfo.species} />
        <InfoRow label="Breed" value={petInfo.breed} />
        <InfoRow label="Infecund" value={sterileText} />
        <InfoRow label="Date of birth" value={formattedBirthDate} />
        <InfoRow label="Age" value={ageText} />
        <InfoRow label="Gender" value={petInfo.gender} />
        <InfoRow label="Weight (kg)" value={petInfo.weight_kg ?? "-"} />
        <InfoRow label="In Medical" value={petInfo.in_medical ? "Yes" : "No"} />
        <div className="col-span-2">
          <InfoRow label="Note" value={petInfo.note} />
        </div>
      </div>
    </div>
  );
}
