"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pet } from "@/types/domain/pet";

function formatAge(birthDateISO: string) {
  const birth = new Date(birthDateISO);
  const now = new Date();

  if (Number.isNaN(birth.getTime())) return "-";

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());

  if (!Number.isFinite(months) || months < 0) months = 0;

  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  return `${years} years`;
}

export default function PetCard({ pet }: { pet: Pet }) {
  const ageText = formatAge(pet.birth_date);
  
  const imageSrc = pet.profile_image || "/pet-placeholder.svg";
  
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/pet-owners/my-pets-page/${pet._id}`)}
      className="w-full text-left"
    >
      <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-4 hover:bg-zinc-50 active:scale-[0.99] transition">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">{`PID:${pet._id}`}</div>
          
        </div>

        {/* Content row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100">
            <Image
              src={imageSrc}
              alt={pet.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <div className="text-lg font-semibold text-zinc-900 leading-none">
              {pet.name}
            </div>

            {/* Bottom row: Age left, Gender right */}
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-zinc-500">
              <div className="whitespace-nowrap">{`Age : ${ageText}`}</div>
              <div className="whitespace-nowrap">{`Gender : ${pet.gender}`}</div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}