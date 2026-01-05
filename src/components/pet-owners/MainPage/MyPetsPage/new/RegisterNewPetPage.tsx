"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PetAvatarPicker from "@/components/pet-owners/MainPage/MyPetsPage/new/PetAvatarPicker";
import { formatAge } from "@/app/lib/pets/age";
import TopBar from "@/components/pet-owners/layout/TopBar";

type Sex = "Male" | "Female" | "Unknown";
type YesNo = "yes" | "no";

export default function RegisterNewPetPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [avatarUrl, setAvatarUrl] = useState<string>("/pet-placeholder.svg");

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [dob, setDob] = useState(""); 
  const [sex, setSex] = useState<Sex>("Female");
  const [color, setColor] = useState("");
  const [hasPrevHistory, setHasPrevHistory] = useState<YesNo>("yes");
  const [prevClinic, setPrevClinic] = useState("");

  const computedAge = useMemo(() => {
    if (!mounted) return "-";
    if (!dob) return "-";
    return formatAge(dob);
  }, [dob, mounted]);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!species.trim()) return false;
    if (!breed.trim()) return false;
    if (!dob) return false;
    if (hasPrevHistory === "yes" && !prevClinic.trim()) return false;
    return true;
  }, [name, species, breed, dob, hasPrevHistory, prevClinic]);

  function onSubmit() {
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      species: species.trim(),
      breed: breed.trim(),
      dob,
      sex,
      color: color.trim(),
      hasPreviousMedicalHistory: hasPrevHistory === "yes",
      previousClinicOrHospitalName:
        hasPrevHistory === "yes" ? prevClinic.trim() : null,
      avatarUrl,
    };

    console.log("CREATE PET:", payload);

    router.push("/pet-owners/mypets");
  }

  return (
    <>
      {/* Page header */}
      <TopBar title="Register New Pet" onBack={() => router.back()} />
          
      {/* Content */}
      <div className="px-6 pb-28">
        {/* Avatar */}
        <div className="flex justify-center py-2">
          <PetAvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Judy"
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
                placeholder="Rabbit"
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
                placeholder="Holland Lop"
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

            <div className="relative">
              <input
                type="date"
                className="w-full rounded-xl border border-zinc-200 bg-white
                          pl-3 pr-2 py-2 text-sm outline-none
                          focus:ring-2 focus:ring-sky-200"

                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
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
                placeholder="Orange"
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
                  onChange={() => {
                    setHasPrevHistory("no");
                    setPrevClinic("");
                  }}
                />
                No
              </label>
            </div>
          </div>

          {/* Previous clinic/hospital (show only when Yes) */}
          {hasPrevHistory === "yes" && (
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1">
                Previous clinic / hospital name
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Happy Paws Animal Clinic"
                value={prevClinic}
                onChange={(e) => setPrevClinic(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom fixed button (kept inside 393px frame) */}
      <div className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 px-6 pb-6 max-w-[393px]">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded-full py-3 text-white text-sm font-semibold shadow-lg transition active:scale-[0.99] bg-sky-500 disabled:bg-sky-300"
        >
          Add New Pet
        </button>
      </div>
    </>
  );
}
