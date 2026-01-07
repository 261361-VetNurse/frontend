"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

import { mockPets } from "@/mocks/pets";
import type { Petss } from "@/types/Petss";
import { formatAge } from "@/app/lib/pets/age";
import TopBar from "@/components/pet-owners/layout/TopBar";

type Sex = "Male" | "Female" | "Unknown";
type YesNo = "yes" | "no";

export default function EditBasicInfo() {
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
          ← Back
        </button>
        <div className="mt-4 text-zinc-700">Petss not found: {String(petId)}</div>
      </div>
    );
  }

  // ✅ ทำให้ TS มั่นใจว่าไม่ undefined
  const currentPet = pet;

  // ค่าเริ่มต้น (prefill)
  const [avatarUrl, setAvatarUrl] = useState(
    currentPet.imageUrl ?? "/pet-placeholder.svg"
  );
  const [name, setName] = useState(currentPet.name ?? "");
  const [species, setSpecies] = useState(currentPet.species ?? "");
  const [breed, setBreed] = useState(currentPet.breed ?? "");
  const [dob, setDob] = useState(currentPet.birthDate ?? ""); // yyyy-mm-dd
  const [sex, setSex] = useState<Sex>((currentPet.gender as Sex) ?? "Unknown");
  const [color, setColor] = useState(currentPet.color ?? "");

  const initialHasHistory: YesNo =
    currentPet.previousClinicOrHospital &&
    currentPet.previousClinicOrHospital.trim() !== ""
      ? "yes"
      : "no";

  const [hasPrevHistory, setHasPrevHistory] =
    useState<YesNo>(initialHasHistory);
  const [prevClinic, setPrevClinic] = useState(
    currentPet.previousClinicOrHospital ?? ""
  );

  const computedAge = useMemo(() => (dob ? formatAge(dob) : "-"), [dob]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!species.trim()) return false;
    if (!breed.trim()) return false;
    if (!dob) return false;
    if (hasPrevHistory === "yes" && !prevClinic.trim()) return false;
    return true;
  }, [name, species, breed, dob, hasPrevHistory, prevClinic]);

  function onUpdate() {
    if (!canSubmit) return;

    const payload = {
      id: currentPet.id,
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      birthDate: dob,
      gender: sex,
      color: color.trim(),
      previousClinicOrHospital:
        hasPrevHistory === "yes" ? prevClinic.trim() : null,
      imageUrl: avatarUrl,
    };

    console.log("UPDATE PET:", payload);

    router.push(`/pet-owners/my-pets-page/${currentPet.id}`);
  }

  return (
    <div>
      {/* Header */}
      <TopBar
        title="Edit Basic Information"
        onBack={() => router.push(`/pet-owners/my-pets-page`)}
      />

      {/* Content */}
      <div className="pt-4 pb-28">
        {/* Avatar */}
        <div className="flex justify-center py-2">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-200">
              <Image
                src={avatarUrl}
                alt="Petss avatar"
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>

            <button
              type="button"
              onClick={() => console.log("change avatar")}
              className="absolute -right-1 -bottom-1 h-8 w-8 rounded-full bg-sky-400 disabled:bg-sky-300 shadow-md grid place-items-center active:scale-[0.98]"
              aria-label="Edit avatar"
              title="Edit avatar"
            >
              <Image src="/edit.svg" alt="" width={18} height={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
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

          {/* Sex + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Sex
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
                Color
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          {/* Has previous medical history */}
          <div>
            <div className="block text-sm font-medium text-zinc-800 mb-2">
              Has previous medical history?
            </div>

            <div className="flex items-center gap-10">
              <label className="flex items-center gap-2 text-sm text-zinc-800">
                <input
                  type="radio"
                  name="prevHistory"
                  value="yes"
                  checked={hasPrevHistory === "yes"}
                  onChange={() => setHasPrevHistory("yes")}
                />
                Yes
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-800">
                <input
                  type="radio"
                  name="prevHistory"
                  value="no"
                  checked={hasPrevHistory === "no"}
                  onChange={() => setHasPrevHistory("no")}
                />
                No
              </label>
            </div>
          </div>

          {/* Previous clinic/hospital (แสดงเฉพาะ Yes) */}
          {hasPrevHistory === "yes" && (
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Previous clinic / hospital name
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={prevClinic}
                onChange={(e) => setPrevClinic(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom fixed button */}
      <div className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 px-6 pb-6 max-w-[393px]">
        <button
          type="button"
          onClick={onUpdate}
          disabled={!canSubmit}
          className="w-full rounded-full py-3 text-white text-sm font-semibold shadow-lg transition active:scale-[0.99] bg-sky-500 disabled:bg-sky-300"
        >
          Update
        </button>
      </div>
    </div>
  );
}
