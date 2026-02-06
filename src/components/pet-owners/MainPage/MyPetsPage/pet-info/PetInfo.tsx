"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// import { usePet } from "@/hooks"; // Removed hook
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
import { deletePet, getPets, authStorage } from "@/services/api/client";

export default function PetInfo() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  // Use local state instead of usage hook
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets directly
  useEffect(() => {
    const fetchPets = async () => {
      try {
        setLoading(true);
        const token = authStorage.getToken();
        if (!token) {
          // Handle no token if necessary, or let getPets fail/mock
          // For now assuming token exists or mock handles it
        }

        // Use getPets from client directly
        // Note: passing token even if getPets handles it locally? 
        // client.ts getPets requires token.
        const data = await getPets(token || "");
        setPets(data);
      } catch (err: any) {
        setError(err.message || "Failed to load pets");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // Derived state
  const pet = useMemo(() => {
    return pets.find((p) => String(p._id) === String(petId));
  }, [pets, petId]);

  /* -------- handlers -------- */
  const handleDelete = async () => {
    if (!pet) return;
    if (!confirm(`Are you sure you want to delete ${pet.name}?`)) return;

    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await deletePet(token, pet._id);

      // Navigate back to my pets
      router.replace("/pet-owners/my-pets-page");
    } catch (err) {
      console.error("Failed to delete pet:", err);
      alert("Failed to delete pet. Please try again.");
    }
  };

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

  const petsForSelector: Pet[] = pets;

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
            router.push(`/pet-owners/my-pets-page/${currentPet._id}/edit`)
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
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </Page>
  );
}