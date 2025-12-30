"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { mockPets } from "@/mocks/pets";
import type { Pet } from "@/types/Pet";

import PetInfoTopBar from "@/components/pets/pet-info/PetInfoTopBar";
import PetSelectorCard from "@/components/pets/pet-info/PetSelectorCard";
import BasicInfoCard from "@/components/pets/pet-info/BasicInfoCard";
import MenuItem from "@/components/pets/pet-info/MenuItem";

import { formatAge } from "@/app/lib/pets/age";

export default function PetInfoPage() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const pet: Pet | undefined = useMemo(
    () => mockPets.find((p) => p.id === String(petId)),
    [petId]
  );

  if (!pet) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="underline">
          ← Back
        </button>
        <div className="mt-4 text-zinc-700">Pet not found: {String(petId)}</div>
      </div>
    );
  }

  const ageText = formatAge(pet.birthDate);

  return (
    <div className="pb-8">
      {/* Top bar */}
      <PetInfoTopBar
        title="Pet Information"
        onBack={() => router.back()}
        onClose={() => router.back()}
      />

      {/* Pet selector card */}
      <div className="px-4 mt-4 relative z-10">
        <PetSelectorCard
        name={pet.name}
        pid={pet.pid ?? pet.id}
        imageUrl={pet.imageUrl}
        selectedId={pet.id}
        options={mockPets.map((p) => ({
            id: p.id,
            name: p.name,
            pid: p.pid ?? p.id,
            imageUrl: p.imageUrl,
        }))}
        onSelect={(id) => router.push(`/pet-owners/mypets/${id}`)}
        />
      </div>

      {/* Pet selector bottom sheet */}
      {isSelectorOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsSelectorOpen(false)}
            aria-label="Close pet selector"
          />

          {/* Sheet */}
          <div className="absolute left-0 right-0 bottom-0 rounded-t-3xl bg-white shadow-xl border-t border-zinc-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold text-zinc-900">
                Select Pet
              </div>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(false)}
                className="text-zinc-500 text-xl px-2"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 max-h-[55vh] overflow-auto space-y-2">
              {mockPets.map((p) => {
                const active = p.id === pet.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setIsSelectorOpen(false);
                      router.push(`/pet-owners/mypets/${p.id}`);
                    }}
                    className={[
                      "w-full text-left rounded-2xl border px-4 py-3 flex items-center justify-between",
                      active
                        ? "border-zinc-300 bg-zinc-50"
                        : "border-zinc-100 bg-white hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-100 shrink-0">
                        <img
                          src={p.imageUrl ?? "/pet-placeholder.svg"}
                          alt={p.name}
                          className="h-10 w-10 object-cover"
                        />
                      </div>

                      <div className="leading-tight">
                        <div className="font-semibold text-zinc-900">
                          {p.name}
                        </div>
                        <div className="text-sm text-zinc-500">{`PID: ${
                          p.pid ?? p.id
                        }`}</div>
                      </div>
                    </div>

                    {active ? (
                      <div className="text-sm text-zinc-600">Selected</div>
                    ) : (
                      <div className="text-zinc-400 text-lg">›</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-zinc-100" />

      {/* Basic Information card */}
      <div className="px-4 mt-4">
        <BasicInfoCard
          name={pet.name}
          species={pet.species ?? "-"}
          breed={pet.breed ?? "-"}
          birthDate={pet.birthDate}
          ageText={ageText}
          sex={pet.gender}
          color={pet.color ?? "-"}
          previousClinic={pet.previousClinicOrHospital ?? "-"}
          onEdit={() => console.log("edit basic info")}
        />
      </div>

      {/* Menu list */}
      <div className="px-4 mt-4 space-y-3">
        <MenuItem
          iconSrc="/icons/calendar.svg"
          title="Appointment"
          onClick={() => router.push(`/pet-owners/mypets/${pet.id}/appointments`)}
        />
        <MenuItem
          iconSrc="/icons/medication.svg"
          title="Medication"
          onClick={() => router.push(`/pet-owners/mypets/${pet.id}/medications`)}
        />
        <MenuItem
          iconSrc="/icons/symptom.svg"
          title="Pet Symptom Record"
          onClick={() => router.push(`/pet-owners/mypets/${pet.id}/symptoms`)}
        />
        <MenuItem
          iconSrc="/icons/history.svg"
          title="Medical History"
          onClick={() => router.push(`/pet-owners/mypets/${pet.id}/history`)}
        />
      </div>

      {/* Delete button */}
      <div className="px-4 mt-6">
        <button
          type="button"
          className="w-full rounded-2xl bg-red-600 text-white py-3 font-semibold hover:bg-red-700 active:scale-[0.99] transition"
          onClick={() => console.log("delete", pet.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
