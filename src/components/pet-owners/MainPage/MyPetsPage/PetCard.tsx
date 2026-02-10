"use client";

import Profile from "@/components/pet-owners/shared/Profile";

import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useRouter } from "next/navigation";
import { Pet } from "@/types/domain/pet";
import { theme } from '@/styles';
import { useMemo } from 'react';

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
  const ageText = formatAge(pet.birth_date || "");
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/pet-owners/my-pets-page/${pet.pet_id}`)}
      className="w-full text-left"
    >
      <div className="rounded-2xl bg-white shadow-sm border border-zinc-100 p-4 hover:bg-zinc-50 active:scale-[0.99] transition">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-500">{`PID:${pet.pet_id}`}</div>
        </div>

        {/* Content row */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative">
            <Profile imageUrl={pet.profile_image} size={56} isPet={true} shape="circle" />
            {pet.in_medical && (
              <div className="absolute -bottom-1 -right-1 z-10 bg-white rounded-full">
                <AddCircleIcon style={{ color: theme.colors.primary }} sx={{ fontSize: 24 }} />
              </div>
            )}
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