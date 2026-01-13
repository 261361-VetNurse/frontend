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

  // เปลี่ยน Default เป็น pet-paw.svg ตามคอมโพเนนต์ใหม่
  const [avatarUrl, setAvatarUrl] = useState<string>("/pet-paw.svg");

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
      {/* Page header  */}
      <TopBar title="Register New Pet" onBack={() => router.back()} />
          
      {/* Content */}
      <div className="px-6 pb-28">
        {/* Avatar Section */}
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
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
              placeholder="Judy"
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
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
                placeholder="Rabbit"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Breed
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
                placeholder="Holland Lop"
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
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
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

          {/* Sex + Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Gender
              </label>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow appearance-none"
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
                Color
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
                placeholder="Orange"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          {/* Medical history question */}
          <div className="pt-2">
            <div className="block text-sm font-medium text-zinc-800 mb-3">
              Has previous medical history?
            </div>

            <div className="flex items-center gap-10">
              <label className="flex items-center gap-2 text-sm text-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="prevHistory"
                  className="w-4 h-4 text-sky-500 border-zinc-300 focus:ring-sky-500"
                  value="yes"
                  checked={hasPrevHistory === "yes"}
                  onChange={() => setHasPrevHistory("yes")}
                />
                Yes
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-800 cursor-pointer">
                <input
                  type="radio"
                  name="prevHistory"
                  className="w-4 h-4 text-sky-500 border-zinc-300 focus:ring-sky-500"
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

          {/* Previous clinic/hospital name */}
          {hasPrevHistory === "yes" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Previous clinic / hospital name
              </label>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-200 transition-shadow"
                placeholder="Happy Paws Animal Clinic"
                value={prevClinic}
                onChange={(e) => setPrevClinic(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom fixed button  */}
      <div className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 px-6 pb-6 max-w-[393px] bg-gradient-to-t from-white via-white to-transparent pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded-full py-3.5 text-white text-sm font-bold shadow-lg shadow-sky-100 transition active:scale-[0.98] bg-sky-500 disabled:bg-zinc-300 disabled:shadow-none"
        >
          Add New Pet
        </button>
      </div>
    </>
  );
}