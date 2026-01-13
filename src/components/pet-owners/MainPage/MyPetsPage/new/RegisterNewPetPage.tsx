"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PetAvatarPicker from "@/components/pet-owners/MainPage/MyPetsPage/new/PetAvatarPicker";
import { formatAge } from "@/app/lib/pets/age";
import TopBar from "@/components/pet-owners/layout/TopBar";
import Button from "@/components/pet-owners/shared/Button";

type Sex = "Male" | "Female" | "Unknown";

export default function RegisterNewPetPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // State fields updated to match Edit page
  const [avatarUrl, setAvatarUrl] = useState<string>("/pet-paw.svg");
  const [name, setName] = useState("");
  const [infecund, setInfecund] = useState<boolean>(false); // Match Edit page
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState<Sex>("Female");
  const [weight, setWeight] = useState(""); // Match Edit page
  const [allergiesInput, setAllergiesInput] = useState(""); // Match Edit page

  const computedAge = useMemo(() => {
    if (!mounted) return "-";
    if (!dob) return "-";
    return formatAge(dob);
  }, [dob, mounted]);

  const canSubmit = useMemo(() => {
    return (
      name.trim() !== "" &&
      species.trim() !== "" &&
      breed.trim() !== "" &&
      dob !== ""
    );
  }, [name, species, breed, dob]);

  function onSubmit() {
    if (!canSubmit) return;

    const allergiesArray = allergiesInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    const payload = {
      name: name.trim(),
      infecund,
      species: species.trim(),
      breed: breed.trim(),
      birth_date: dob,
      gender: sex,
      weight_kg: weight.trim() === "" ? null : weight,
      allergies: allergiesArray,
      profile_image: avatarUrl,
    };

    console.log("CREATE PET:", payload);
    // ในโปรเจกต์จริงตรงนี้จะเรียก API POST ข้อมูล
    router.push("/pet-owners/mypets");
  }

  return (
    <>
      <TopBar title="Register New Pet" onBack={() => router.back()} />

      <div className="px-6 pb-28">
        <div className="flex justify-center py-6">
          <PetAvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
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

          {/* Gender + Weight - Updated to match Edit page */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Gender
              </label>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 appearance-none"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Unknown">Unknown</option>
              </select>
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

          {/* Infecund (Sterile) - Added to match Edit page */}
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


          {/* Allergies - Added to match Edit page */}
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
          disabled={!canSubmit}
          style={{ padding: "14px" }}
        >
          Add New Pet
        </Button>
      </div>
    </>
  );
}