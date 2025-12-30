"use client";

import OwnerHeaderCard from "@/components/pets/OwnerHeaderCard";
import StatCard from "@/components/pets/StatCard";
import NewPetButton from "@/components/pets/NewPet";
import PetCard from "@/components/pets/PetCard";

import { mockPets } from "@/mocks/pets";
import { mockOwner } from "@/mocks/owner";
import { Pet } from "@/types/Pet";

export default function PetsPage() {
  // mock data (moved out of page)
  const pets: Pet[] = mockPets;

  const allPetsCount = pets.length;

  const inMedicalCount = 0;

  return (
    <div className="pb-6">
      <div className="space-y-4">
        {/* Owner card */}
        <OwnerHeaderCard
          name={mockOwner.name}
          ownerId={mockOwner.id}
          avatarUrl={mockOwner.avatarUrl ?? "/Ava.svg"}
        />

        {/* Section title */}
        <div className="pt-2">
          <div className="text-lg font-semibold text-zinc-900">My Pets</div>
        </div>

        {/* Stats + New Pet */}
        <div className="flex items-start gap-3">
          <div className="flex-1 flex gap-3">
            <StatCard title="All Pets" value={allPetsCount} />
            <StatCard title="In Medical" value={inMedicalCount} />
          </div>

          <NewPetButton onClick={() => console.log("new pet")} />
        </div>

        {/* Pet list */}
        <div className="space-y-3">
          {pets.length === 0 ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-500">
              No pets yet. Click “New Pet” to add one.
            </div>
          ) : (
            pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
          )}
        </div>
      </div>
    </div>
  );
}
