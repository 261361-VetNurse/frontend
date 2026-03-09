"use client";

import Profile from "@/components/pet-owners/shared/Profile";
import { useRouter } from '@/hooks/use-next-routing';
import { Pet } from "@/types/domain/pet";
import Image from '@/components/shared/Image';

import { formatAge } from "@/lib/pets/age";

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
              <div className="absolute bottom-1 right-0 z-10 bg-white rounded-full">
                <Image src="/medical-symbol-red.svg" alt="Medical" width={20} height={20} />
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