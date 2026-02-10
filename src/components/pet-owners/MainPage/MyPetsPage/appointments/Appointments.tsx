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
import AppointmentDetail from "@/components/pet-owners/shared/appointment/AppointmentDetail";

import type { Appointment } from "@/types/domain/appointment";
import { usePets } from "@/hooks/usePets";
import { useAppointments } from "@/hooks/useAppointments";
import { getAppointmentDetail, createAppointment, authStorage } from "@/services/api/client";

import AddAppointmentPopup from "@/components/pet-owners/MainPage/CalendarPage/appointment/AddAppointmentPopup";
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { QuickDialButton } from "@/components/shared";

export default function MyPetsAppointments() {
  const router = useRouter();
  const { pet_id } = useParams<{ pet_id: string }>();

  // Use mockPets directly as it matches Pet[] expected by PetFilterSelector
  const { pets } = usePets();
  const petOptions: Pet[] = pets;

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    const fromUrl = String(pet_id ?? "");
    if (fromUrl && petOptions.some((p) => String(p.pet_id) === fromUrl)) return fromUrl;
    return String(petOptions[0]?.pet_id ?? "");
  });

  useEffect(() => {
    const fromUrl = String(pet_id ?? "");
    if (!fromUrl) return;

    const exists = petOptions.some((p) => String(p.pet_id) === fromUrl);
    if (exists) setSelectedPetId(fromUrl);
  }, [pet_id, petOptions]);

  useEffect(() => {
    if (!selectedPetId) return;
    const exists = petOptions.some((p) => String(p.pet_id) === selectedPetId);
    if (!exists) setSelectedPetId(String(petOptions[0]?.pet_id ?? ""));
  }, [selectedPetId, petOptions]);

  const selectedPet = useMemo(() => {
    return petOptions.find((p) => String(p.pet_id) === selectedPetId) ?? petOptions[0];
  }, [petOptions, selectedPetId]);

  const [tab, setTab] = useState<AppointmentTabKey>("upcoming");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [detail, setDetail] = useState<Appointment | null>(null);

  const { appointments } = useAppointments(); // Fetch all appointments

  const allAppointments: Appointment[] = useMemo(() => {
    return appointments.filter((a: any) => String(a.pet_id) === String(selectedPetId));
  }, [appointments, selectedPetId]);

  const filtered = useMemo(() => {
    return allAppointments.filter((a) => a.status.toLowerCase() === tab.toLowerCase());
  }, [allAppointments, tab]);

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of filtered) {
      const label = formatDateHeader(a.appointment_date);
      map.set(label, [...(map.get(label) ?? []), a]);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [filtered]);

  const handleAdd = () => setShowCreatePopup(true);
  const handleClosePopup = () => setShowCreatePopup(false);
  const handleSubmitPopup = async (data: any) => {
    console.log("handleSubmitPopup called. Data:", data);
    // try {
    //   const token = authStorage.getToken();
    //   if (!token) throw new Error("No token found");

    //   await createAppointment(token, data);
    //   setShowCreatePopup(false);

    //   // Refresh appointments list
    //   window.location.reload();
    // } catch (err) {
    //   console.error("Failed to create appointment:", err);
    //   alert("Failed to create appointment. Please try again.");
    // }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");
      const data = await getAppointmentDetail(token, Number(id));
      setDetail(data);
    } catch (err) {
      console.error("Failed to load appointment detail:", err);
      // alert("Failed to load detail");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TopBar
        title="Appointment"
        onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.pet_id}`)}
      />

      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={petOptions}
        value={Number(selectedPetId)}
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
                  key={a.appointment_id}
                  appointment={{
                    id: String(a.appointment_id),
                    petName: selectedPet?.name || "-",
                    date: normalizeDateText(a.appointment_date),
                    time: new Date(a.appointment_date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false }),
                    location: a.location,
                  }}
                  onOpenDetail={handleOpenDetail}
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
          pet_id: selectedPet?.pet_id ?? 0,
          name: selectedPet?.name ?? "-",
          profile_image: selectedPet?.profile_image ?? undefined,
        }}
      />

      {/* Appointment Detail Popup */}
      <AppointmentDetail
        open={!!detail}
        appointment={detail}
        onClose={() => setDetail(null)}
        onEdit={(appt) => {
          console.log("Edit clicked", appt);
          setDetail(null);
          // implement edit if needed
        }}
        onDelete={(id) => {
          console.log("Delete clicked", id);
          setDetail(null);
          // implement delete if needed
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