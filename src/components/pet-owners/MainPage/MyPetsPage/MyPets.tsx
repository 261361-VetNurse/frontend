"use client";

import { useEffect, useState } from "react";

import OwnerHeaderCard from "@/components/pet-owners/MainPage/MyPetsPage/OwnerHeaderCard";
import StatCard from "@/components/pet-owners/MainPage/MyPetsPage/StatCard";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import PetCard from "@/components/pet-owners/MainPage/MyPetsPage/PetCard";

import { Pet } from "@/types/pet";
import { Page } from "@/styles/myPetsPage.styled";

// ✅ ใช้ axios instance ที่แนบ mock token
import api from "@/lib/api";

export default function MyPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allPetsCount = pets.length;
  const inMedicalCount = 0; // TODO: ทำภายหลัง

  useEffect(() => {
    const fetchPets = async () => {
      try {
        setError(null);
        const res = await api.get("/v1/pets");
        console.log("pets from backend:", res.data);
        setPets(res.data);
      } catch (err) {
        console.error("fetch pets error:", err);
        setError("Failed to load pets");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  return (
    <Page>
      <div className="flex flex-col gap-4">
        {/* Owner header (mock user) */}
        <OwnerHeaderCard
          name="Mock Owner"
          ownerId="mock-owner-id"
          avatarUrl="/Ava.svg"
          OwnerPageUrl="/pet-owners/owner-info-page"
        />

        <div>
          <div className="text-lg font-semibold text-zinc-900">
            My Pets
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <StatCard title="All Pets" value={allPetsCount} />
            <StatCard title="In Medical" value={inMedicalCount} />
          </div>
          <NewPetButton />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-400">
              Loading pets...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
              {error}
            </div>
          ) : pets.length === 0 ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-500">
              No pets yet. Click “New Pet” to add one.
            </div>
          ) : (
            pets.map((pet) => (
              <PetCard key={pet._id} pet={pet} />
            ))
          )}
        </div>
      </div>
    </Page>
  );
}
