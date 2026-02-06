"use client";

import OwnerHeaderCard from "@/components/pet-owners/MainPage/MyPetsPage/OwnerHeaderCard";
import StatCard from "@/components/pet-owners/MainPage/MyPetsPage/StatCard";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import PetCard from "@/components/pet-owners/MainPage/MyPetsPage/PetCard";
import { useRouter } from "next/navigation";

import { getUserProfile, getPets, authStorage } from "@/services/api/client";
import { useState, useEffect } from "react";
import { UserProfile } from "@/types/domain/user";
import { Pet } from "@/types/domain/pet";

import { Page } from "@/styles/components/my-pets-page.styled";

export default function MyPets() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = authStorage.getToken();
        if (!token) {
          router.push('/pet-owners/login-page');
          return;
        }

        const [userData, petsData] = await Promise.all([
          getUserProfile(token),
          getPets(token)
        ]);

        setUser(userData);
        setPets(petsData);
      } catch (e: any) {
        console.error("Failed to load data", e);
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allPetsCount = pets.length;
  const inMedicalCount = pets.filter((pet) => pet.in_medical).length;

  if (loading) {
    return (
      <Page>
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500">Loading data...</div>
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

  return (
    <Page>
      <div className="flex flex-col gap-4">
        <OwnerHeaderCard
          name={user ? user.fname : "Loading..."}
          ownerId={user ? user.id : "..."}
          avatarUrl={user?.picture_url ?? "/images/profile-test.png"}
          OwnerPageUrl="/pet-owners/owner-info-page"
        />

        <div>
          <div className="text-lg font-semibold text-zinc-900">My Pets</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 grid grid-cols-2 gap-3">
            <StatCard title="All Pets" value={allPetsCount} />
            <StatCard title="In Medical" value={inMedicalCount} />
          </div>
          <NewPetButton />
        </div>

        <div className="space-y-3">
          {pets.length === 0 ? (
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-500">
              No pets yet. Click "New Pet" to add one.
            </div>
          ) : (
            pets.map((pet) => <PetCard key={pet._id} pet={pet} />)
          )}
        </div>
      </div>
    </Page>
  );
}