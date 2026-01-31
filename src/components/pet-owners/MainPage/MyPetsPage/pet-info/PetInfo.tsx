"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePet } from "@/hooks";
import { Pet } from "@/types/domain/pet";
import TopBar from "@/components/pet-owners/layout/TopBar";
import BasicInfoCard from "@/components/pet-owners/MainPage/MyPetsPage/pet-info/BasicInfoCard";
import MenuItem from "@/components/pet-owners/MainPage/MyPetsPage/pet-info/MenuItem";
import { formatAge } from "@/lib/pets/age";
import { Page } from "@/styles/components/my-pets-page.styled";
// shared component
import PetFilterSelector, {
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

export default function PetInfo() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const { pet, pets, loading, error } = usePet(petId);

  if (loading) {
    return (
      <Page>
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500">Loading pet information...</div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </Page>
    );
  }

  if (!pet) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="underline">
          ← Back
        </button>
        <div className="mt-4 text-zinc-700">
          Pet not found: {String(petId)}
        </div>
      </div>
    );
  }

  const currentPet = pet;
  const ageText = formatAge(currentPet.birth_date);

  const petsForSelector: Pet[] = useMemo(
    () => pets,
    [pets]
  );

  const menus = [
    {
      iconSrc: "/calendar-app.svg",
      title: "Appointment",
      href: `/pet-owners/my-pets-page/${currentPet._id}/appointments`,
    },
    {
      iconSrc: "/medication.svg",
      title: "Medication",
      href: `/pet-owners/my-pets-page/${currentPet._id}/medications`,
    },
    {
      iconSrc: "/record.svg",
      title: "Pets Symptom Record",
      href: `/pet-owners/my-pets-page/${currentPet._id}/symptoms`,
    },
  ];

  return (
    <Page>
      <TopBar
        title="Pets Information"
        onBack={() => router.push(`/pet-owners/my-pets-page`)}
      />

      {/* Pet selector (shared component) */}
      <div className="mt-4">
        <PetFilterSelector
          mode="filter"
          allowAllPets={false}
          pets={petsForSelector}
          value={String(currentPet._id) as PetSelectorValue}
          onChange={(v) => {
            router.push(`/pet-owners/my-pets-page/${String(v)}`);
          }}
          placeholder="Select your pet"
        />
      </div>

      {/* Basic Information */}
      <div className="mt-3">
        <BasicInfoCard
          name={currentPet.name}
          species={currentPet.species ?? "-"}
          breed={currentPet.breed ?? "-"}
          birthDate={currentPet.birth_date}
          ageText={ageText}
          sex={currentPet.gender}
          onEdit={() =>
            router.push(`/pet-owners/my-pets-page/${currentPet._id}/edit`) // ✅ ใช้ _id
          }
        />
      </div>

      {/* Menu list */}
      <div className="mt-4 space-y-3">
        {menus.map((m) => (
          <MenuItem
            key={m.title}
            iconSrc={m.iconSrc}
            title={m.title}
            onClick={() => router.push(m.href)}
          />
        ))}
      </div>

      {/* Delete button */}
      <div className="mt-6">
        <button
          type="button"
          className="w-full rounded-2xl bg-red-600 text-white py-3 font-semibold hover:bg-red-700 active:scale-[0.99] transition"
          onClick={() => console.log("delete", currentPet._id)}
        >
          Delete
        </button>
      </div>
    </Page>
  );
}