"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/pet-owners/layout/TopBar";

import PetFilterSelector, {
} from "@/components/pet-owners/shared/PetFilterSelector";

import { Pet } from "@/types/domain/pet";

import AppointmentCard from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentCard";
import AppointmentTabs, {
  type AppointmentTabKey,
} from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentTabs";
import AppointmentDateSection from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentDateSection";

import { mockPets } from "@/mocks/pets.mock";
import { mockAppointmentsByPetId } from "@/mocks/appointments";
import type { Appointment } from "@/types/domain/appointment";

import AddAppointmentPopup from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AddAppointmentPopup";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { QuickDialButton } from "@/components/shared";

export default function Appointments() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  // Use mockPets directly as it matches Pet[] expected by PetFilterSelector
  const petOptions: Pet[] = mockPets;

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    const fromUrl = String(petId ?? "");
    if (fromUrl && petOptions.some((p) => p._id === fromUrl)) return fromUrl;
    return String(petOptions[0]?._id ?? "");
  });

  useEffect(() => {
    const fromUrl = String(petId ?? "");
    if (!fromUrl) return;

    const exists = petOptions.some((p) => p._id === fromUrl);
    if (exists) setSelectedPetId(fromUrl);
  }, [petId, petOptions]);

  useEffect(() => {
    if (!selectedPetId) return;
    const exists = petOptions.some((p) => p._id === selectedPetId);
    if (!exists) setSelectedPetId(String(petOptions[0]?._id ?? ""));
  }, [selectedPetId, petOptions]);

  const selectedPet = useMemo(() => {
    return petOptions.find((p) => p._id === selectedPetId) ?? petOptions[0];
  }, [petOptions, selectedPetId]);

  const [tab, setTab] = useState<AppointmentTabKey>("upcoming");
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const allAppointments: Appointment[] = useMemo(() => {
    return mockAppointmentsByPetId[selectedPetId] ?? [];
  }, [selectedPetId]);

  const filtered = useMemo(() => {
    return allAppointments.filter((a) => a.status === tab);
  }, [allAppointments, tab]);

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of filtered) {
      const label = formatDateHeader(a.date);
      map.set(label, [...(map.get(label) ?? []), a]);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [filtered]);

  const handleAdd = () => setShowCreatePopup(true);
  const handleClosePopup = () => setShowCreatePopup(false);
  const handleSubmitPopup = (data: any) => {
    console.log("submit appointment", data);
    setShowCreatePopup(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <TopBar
        title="Appointment"
        onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?._id}`)}
      />

      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={petOptions}
        value={selectedPetId}
        onChange={(id) => {
          const nextId = String(id);
          setSelectedPetId(nextId);
          router.push(`/pet-owners/my-pets-page/${nextId}/appointments`);
        }}
      />

      <div style={{ marginTop: 8 }}>
        <AppointmentTabs value={tab} onChange={setTab} />
      </div>

      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 24 }}>
        {grouped.length === 0 ? (
          <div style={{ fontSize: 14, color: "#71717a" }}>No appointments</div>
        ) : (
          grouped.map((sec) => (
            <AppointmentDateSection key={sec.label} label={sec.label}>
              {sec.items.map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={{
                    id: a.id,
                    petName: a.petName,
                    date: normalizeDateText(a.date),
                    time: a.time,
                    location: a.location,
                    status: a.status,
                  }}
                  onOpenDetail={(id) => console.log("open detail", id)}
                />
              ))}
            </AppointmentDateSection>
          ))
        )}
      </div>

      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={handleAdd}
      />

      <AddAppointmentPopup
        open={showCreatePopup}
        onClose={handleClosePopup}
        onSubmit={handleSubmitPopup}
        pet={{
          id: selectedPet?._id ?? "",
          name: selectedPet?.name ?? "-",
          pid: selectedPet?._id ?? "-",
          avatarUrl: selectedPet?.profile_image,
        }}
      />
    </div>
  );
}

function formatDateHeader(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

function normalizeDateText(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
}