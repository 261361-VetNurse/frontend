"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockPets } from "@/mocks/pets";
import type { Petss } from "@/types/Petss";
import TopBar from "@/components/pet-owners/layout/TopBar";
import BasicInfoCard from "@/components/pet-owners/MainPage/MyPetsPage/pet-info/BasicInfoCard";
import MenuItem from "@/components/pet-owners/MainPage/MyPetsPage/pet-info/MenuItem";
import { formatAge } from "@/app/lib/pets/age";
import { Page } from "@/styles/myPetsPage.styled";

// shared component
import PetFilterSelector, {
  type PetLite,
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

export default function PetInfo() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const pet: Petss | undefined = useMemo(
    () => mockPets.find((p) => p.id === String(petId)),
    [petId]
  );

  if (!pet) {
    return (
      <div className="p-6">
        <button onClick={() => router.back()} className="underline">
          ←
        </button>
        <div className="mt-4 text-zinc-700">
          Petss not found: {String(petId)}
        </div>
      </div>
    );
  }

  const currentPet = pet;
  const ageText = formatAge(currentPet.birthDate);

  // map mockPets -> PetLite (data contract ของ shared component)
  const petsForSelector: PetLite[] = useMemo(
    () =>
      mockPets.map((p) => ({
        id: p.id,
        name: p.name,
        pid: p.pid ?? p.id,
        avatarUrl: p.imageUrl, // mock ใช้ imageUrl → map เป็น avatarUrl
      })),
    []
  );

  const menus = [
    {
      iconSrc: "/calendar-app.svg",
      title: "Appointment",
      href: `/pet-owners/my-pets-page/${currentPet.id}/appointments`,
    },
    {
      iconSrc: "/medication.svg",
      title: "Medication",
      href: `/pet-owners/my-pets-page/${currentPet.id}/medications`,
    },
    {
      iconSrc: "/record.svg",
      title: "Petss Symptom Record",
      href: `/pet-owners/my-pets-page/${currentPet.id}/symptoms`,
    },
    {
      iconSrc: "/history.svg",
      title: "Medical History",
      href: `/pet-owners/my-pets-page/${currentPet.id}/medical`,
    },
  ];

  return (
    <Page>
      <TopBar
        title="Petss Information"
        onBack={() => router.push(`/pet-owners/my-pets-page`)}
      />

      {/* Pet selector (shared component) */}
      <div className="mt-4">
        <PetFilterSelector
          mode="filter"
          allowAllPets={false}
          pets={petsForSelector}
          value={currentPet.id as PetSelectorValue}
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
          birthDate={currentPet.birthDate}
          ageText={ageText}
          sex={currentPet.gender}
          color={currentPet.color ?? "-"}
          previousClinic={currentPet.previousClinicOrHospital ?? "-"}
          onEdit={() =>
            router.push(`/pet-owners/my-pets-page/${currentPet.id}/edit`)
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
          onClick={() => console.log("delete", currentPet.id)}
        >
          Delete
        </button>
      </div>
    </Page>
  );
}
