"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { mockPets } from "@/mocks/pets.mock";
import { Pet } from "@/types/pet";
import { formatAge } from "@/app/lib/pets/age";
import TopBar from "@/components/pet-owners/layout/TopBar";
import Button from "@/components/pet-owners/shared/Button";

type Sex = "Male" | "Female" | "Unknown";

export default function EditBasicInfo() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const pet: Pet | undefined = useMemo(
    () => mockPets.find((p) => String(p._id) === String(petId)),
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

  const currentPet = pet;

  const [avatarUrl, setAvatarUrl] = useState(
    currentPet.profile_image ?? "/pet-placeholder.svg"
  );
  const [name, setName] = useState(currentPet.name ?? "");
  const [species, setSpecies] = useState(currentPet.species ?? "");
  const [breed, setBreed] = useState(currentPet.breed ?? "");
  const [dob, setDob] = useState(
  currentPet.birth_date
    ? dayjs(currentPet.birth_date).format("YYYY-MM-DD")
    : ""
);

  const [sex, setSex] = useState<Sex>((currentPet.gender as Sex) ?? "Unknown");
  const [weight, setWeight] = useState(currentPet.weight_kg ?? "");
  const [infecund, setInfecund] = useState<boolean>(currentPet.infecund ?? false);
  const [allergiesInput, setAllergiesInput] = useState(
    currentPet.allergies ? currentPet.allergies.join(", ") : ""
  );

  const computedAge = useMemo(() => (dob ? formatAge(dob) : "-"), [dob]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!species.trim()) return false;
    if (!breed.trim()) return false;
    if (!dob) return false;
    return true;
  }, [name, species, breed, dob]);

  function onUpdate() {
    if (!canSubmit) return;

    const allergiesArray = allergiesInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    const payload = {
      ...currentPet, 
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      birth_date: dob,
      gender: sex,
      weight_kg: weight.trim() === "" ? null : weight,
      infecund: infecund,
      allergies: allergiesArray,
      profile_image: avatarUrl,
    };

    console.log("UPDATE PET:", payload);

    const index = mockPets.findIndex((p) => p._id === currentPet._id);
    if (index !== -1) {
      mockPets[index] = payload;
    }

    router.push(`/pet-owners/my-pets-page/${currentPet._id}`);
  }

  return (
    <div>
      <TopBar
        title="Edit Basic Information"
        onBack={() => router.push(`/pet-owners/my-pets-page/${currentPet._id}`)}
      />

      <div className="pt-4 pb-28">
        {/* Avatar */}
        <div className="flex justify-center py-2">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-200">
              <Image
                src={avatarUrl}
                alt="Pet avatar"
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full bg-sky-500 shadow-md grid place-items-center"
            >
              <Image src="/edit.svg" alt="" width={14} height={14} className="invert brightness-0" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-6 mt-4">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Species + Breed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Species
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Breed
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
          </div>

          {/* DOB + Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Date of birth
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200 text-center"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Age
              </label>
              <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                {computedAge}
              </div>
            </div>
          </div>

          {/* Sex + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Gender
              </label>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Weight (kg)
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 4.5"
              />
            </div>
          </div>

                    {/* Infecund (Sterile) */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-2">
              Infecund
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-800 cursor-pointer">
                <input 
                  type="radio" 
                  checked={infecund === true} 
                  onChange={() => setInfecund(true)}
                  className="accent-sky-500 w-4 h-4"
                /> 
                Yes
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-800 cursor-pointer">
                <input 
                  type="radio" 
                  checked={infecund === false} 
                  onChange={() => setInfecund(false)}
                  className="accent-sky-500 w-4 h-4"
                /> 
                No
              </label>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Allergies
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              placeholder="e.g. Chicken, Beef, Dust (comma separated)"
            />
          </div>

        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 px-6 pb-6 max-w-[393px] bg-gradient-to-t from-white via-white to-transparent pt-4">
        <Button
          fullWidth
          variant="primary"
          shape="pill"
          size="lg"
          onClick={onUpdate}
          disabled={!canSubmit}
          style={{ padding: "14px" }}
        >
          Update
        </Button>
      </div>
    </div>
  );
}