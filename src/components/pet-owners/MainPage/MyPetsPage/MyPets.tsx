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
import SectionError from "@/components/pet-owners/shared/SectionError";

export default function MyPets() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [petsError, setPetsError] = useState<string | null>(null);

  const fetchPetsData = async (token: string) => {
    try {
      setPetsError(null);
      const petsData = await getPets(token);
      setPets(petsData);
    } catch (e: any) {
      console.error("Failed to load pets", e);
      setPetsError("Failed to load pets");
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      setUserError(null);
      const userData = await getUserProfile(token);
      setUser(userData);
    } catch (e: any) {
      console.error("Failed to load user", e);
      setUserError("Failed to load profile");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const token = authStorage.getToken();
      if (!token) {
        router.push('/pet-owners/login-page');
        return;
      }

      await Promise.all([
        fetchUserData(token),
        fetchPetsData(token)
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const allPetsCount = pets.length;
  const inMedicalCount = pets.filter((pet) => pet.in_medical).length;

  if (loading && !user && pets.length === 0) {
    return (
      <Page>
        <div className="flex items-center justify-center h-64">
          <div className="text-zinc-500">Loading data...</div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="flex flex-col gap-4">
        <OwnerHeaderCard
          name={user?.fname || (userError ? "Pet Owner" : "Loading...")}
          ownerId={user?.user_id || (userError ? "-" : "...")}
          avatarUrl={user?.picture_url}
          OwnerPageUrl="/pet-owners/owner-info-page"
        />

        <div>
          <div className="text-lg font-semibold text-zinc-900">My Pets</div>
        </div>

        <div className="flex items-center gap-3">
          {/* If pets failed loading, count might be 0, but that's acceptable for stats card or we could hide/dim them */}
          <div className="flex-1 grid grid-cols-2 gap-3">
            <StatCard title="All Pets" value={allPetsCount} />
            <StatCard title="In Medical" value={inMedicalCount} />
          </div>
          <NewPetButton />
        </div>

        <div className="space-y-3">
          {petsError ? (
            <SectionError message="Could not load pets list" onRetry={() => {
              const token = authStorage.getToken();
              if (token) fetchPetsData(token);
            }} />
          ) : (
            pets.length === 0 ? (
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-500">
                No pets yet. Click "New Pet" to add one.
              </div>
            ) : (
              pets.map((pet) => <PetCard key={pet.pet_id} pet={pet} />)
            )
          )}
        </div>
      </div>
    </Page>
  );
}