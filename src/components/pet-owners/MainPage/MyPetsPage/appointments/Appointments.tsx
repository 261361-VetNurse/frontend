"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetSelectorCard from "@/components/pet-owners/MainPage/MyPetsPage/PetSelectorCard";
import AppointmentCard from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentCard";
import AppointmentTabs, {
  type AppointmentTabKey,
} from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentTabs";
import AppointmentDateSection from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentDateSection";
import { mockAppointmentsByPetId } from "@/mocks/appointments";
import { mockPetInformationById } from "@/mocks/petInformation";
import type { Appointment } from "@/types/Appointment";
import AddAppointmentPopup from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AddAppointmentPopup";
import { FabButton } from "@/styles/appointments.styled";
import { Add } from "@mui/icons-material";

type PetOption = {
  id: string;      
  name: string;
  pid: string;   
  imageUrl?: string;
};

export default function Appointments() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>(); 

  const petOptions: PetOption[] = useMemo(() => {
    return Object.values(mockPetInformationById).map((p) => ({
      id: String(p.header.id),
      name: p.header.name,
      pid: p.header.pid,
      imageUrl: p.header.avatarUrl,
    }));
  }, []);

  const [selectedPetId, setSelectedPetId] = useState<string>(
    String(petId ?? petOptions[0]?.id ?? "")
  );

  useEffect(() => {
    if (!petId) return;
    const idFromUrl = String(petId);

    const exists = petOptions.some((p) => p.id === idFromUrl);
    if (exists) setSelectedPetId(idFromUrl);
  }, [petId, petOptions]);

  const selectedPet =
    petOptions.find((p) => p.id === selectedPetId) ?? petOptions[0];

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
    <>
      <TopBar title="Appointment" onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.id}`)} />

      <div style={{ marginTop: 8 }}>
        <PetSelectorCard
          name={selectedPet?.name ?? "-"}
          pid={selectedPet?.pid ?? "-"}
          imageUrl={selectedPet?.imageUrl}
          options={petOptions}
          selectedId={selectedPetId}
          onSelect={(id) => {
            setSelectedPetId(id);
            router.push(`/pet-owners/my-pets-page/${id}/appointments`);
          }}
        />
      </div>

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

      <FabButton onClick={handleAdd}>
        <Add />
      </FabButton>

      <AddAppointmentPopup
        open={showCreatePopup}
        onClose={handleClosePopup}
        onSubmit={handleSubmitPopup}
        pet={{
          id: selectedPet?.id ?? "",
          name: selectedPet?.name ?? "-",
          pid: selectedPet?.pid ?? "-",
          avatarUrl: selectedPet?.imageUrl,
        }}
      />
    </>
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
