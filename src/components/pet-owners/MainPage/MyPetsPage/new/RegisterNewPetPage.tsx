"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { formatAge } from "@/lib/pets/age";
import TopBar from "@/components/pet-owners/layout/TopBar";
import Button from "@/components/pet-owners/shared/Button";
import { createPet, authStorage } from "@/services/api/client";
import { CreatePetDTO } from "@/types";

type Sex = "Male" | "Female" | "Unknown" | "";

export default function RegisterNewPetPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ===== State =====
  const [avatarUrl, setAvatarUrl] = useState<string>("https://pub-3e437263844040f89f54d0fb123338fe.r2.dev/blank_pet_profile_1x.webp");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState("");

  const [sex, setSex] = useState<Sex>(""); // ยังไม่เลือก
  const [infecund] = useState<boolean | null>(false); // ยังไม่เลือก
  const [inMedical, setInMedical] = useState<boolean>(false);

  const [weight, setWeight] = useState<string>("");
  const [allergiesInput, setAllergiesInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== Computed =====
  const computedAge = useMemo(() => {
    if (!mounted || !dob) return "-";
    return formatAge(dob);
  }, [dob, mounted]);

  const canSubmit = useMemo(() => {
    return (
      name.trim() !== "" &&
      species.trim() !== "" &&
      breed.trim() !== "" &&
      dob !== "" &&
      sex !== "" &&
      infecund !== null
    );
  }, [name, species, breed, dob, sex, infecund]);

  // ===== Submit =====
  async function onSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);



    const payload: CreatePetDTO = {
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim() || null,
      birth_date: dob,
      gender: sex,
      infecund: infecund ?? false,
      in_medical: inMedical,
      weight_kg: weight ? parseFloat(weight) : undefined,
      profile_image: avatarUrl,
      color: null,
    };

    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await createPet(token, payload);
      router.push("/pet-owners/my-pets-page");
    } catch (err) {
      console.error("Failed to create pet:", err);
      alert("Failed to create pet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <TopBar title="Register New Pet" onBack={() => router.back()} />

      <div className="px-6 pb-28">
        <div className="flex justify-center py-6">
          <ImageUpload
            folder="pet-profile"
            currentImage={avatarUrl}
            onUploadComplete={(url) => setAvatarUrl(url)}
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-sm self-center"
          />
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1.5">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Mochi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Species + Breed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Species
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="cat"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Breed
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Scottish Fold"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
              />
            </div>
          </div>

          {/* DOB + Age */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Date of birth
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Age
              </label>
              <div className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-600">
                {computedAge}
              </div>
            </div>
          </div>

          {/* Gender + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Gender
              </label>

              <div className="relative">
                <select
                  className={`w-full rounded-xl border bg-white px-3 py-2.5 pr-10
                    text-sm outline-none focus:ring-2 focus:ring-sky-200 appearance-none
                    ${sex === "" ? "text-zinc-400" : "text-zinc-900"}
                  `}
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                >
                  {/* placeholder (แสดงอย่างเดียว เลือกไม่ได้) */}
                  <option value="" disabled hidden>
                    Select gender
                  </option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Unknown">Unknown</option>
                </select>

                {/* dropdown icon */}
                <Image
                  src="/down-icon.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Weight (kg)
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="e.g. 4.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          {/* In Medical */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={inMedical ?? false}
              onChange={(e) => setInMedical(e.target.checked)}
              className="accent-sky-500 w-4 h-4"
            />
            <label className="text-sm text-zinc-800">In Medical</label>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1.5">
              Allergies
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="e.g. Chicken, Beef, Dust (comma separated)"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
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
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add New Pet"}
        </Button>
      </div>
    </>
  );
}
