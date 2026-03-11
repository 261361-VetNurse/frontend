"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from '@/hooks/use-next-routing';
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector from "@/components/pet-owners/shared/PetFilterSelector";
import { Pet } from "@/types/domain/pet";
import AppointmentCard from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentCard";
import { Tabs } from "@/components/pet-owners/shared/Tabs";
import AppointmentDateSection from "@/components/pet-owners/MainPage/MyPetsPage/appointments/AppointmentDateSection";
import AppointmentDetail from "@/components/pet-owners/shared/appointment/AppointmentDetail";
import type { Appointment } from "@/types/domain/appointment";
import { usePets } from "@/hooks/usePets";
import { useAppointments } from "@/hooks/useAppointments";
import { getAppointmentDetail, createAppointment, authStorage } from "@/services/api/client";
import AddAppointmentPopup from "@/components/pet-owners/shared/appointment/AddAppointmentPopup";
import Image from '@/components/shared/Image';
import { QuickDialButton } from "@/components/shared";
import { AddAppointmentPayload } from "@/types/api/appointment.dto";
import { getLocalDateString } from "@/utils/dateUtils";

const AddRoundedIcon = () => (
  <Image
    src="/add-new.svg"
    alt="add"
    style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }}
  />
);

export default function MyPetsAppointments() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pet_id } = useParams<{ pet_id: string }>();

  const { pets } = usePets();
  const { appointments } = useAppointments();

  const petOptions: Pet[] = pets;

  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [detail, setDetail] = useState<Appointment | null>(null);

  // ✅ ใช้ tick สำหรับบังคับ re-render ทุก 1 นาที
  const [tick, setTick] = useState(0);

  const tabData = [
    { name: "Upcoming", params: "upcoming" },
    { name: "Completed", params: "completed" },
    { name: "Canceled", params: "canceled" },
  ];

  const currentTab = searchParams.get('tab') || 'upcoming';

  // sync pet จาก URL
  useEffect(() => {
    if (!petOptions.length) return;

    const fromUrl = String(pet_id ?? "");
    const exists = petOptions.some(p => String(p.pet_id) === fromUrl);

    if (exists) {
      setSelectedPetId(fromUrl);
    } else {
      setSelectedPetId(String(petOptions[0].pet_id));
    }
  }, [pet_id, petOptions]);

  // ✅ auto refresh เวลาเฉพาะตอนอยู่ upcoming
  useEffect(() => {
    if (currentTab !== "upcoming") return;

    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000); // 1 นาที

    return () => clearInterval(interval);
  }, [currentTab]);

  const selectedPet = useMemo(() => {
    return petOptions.find(p => String(p.pet_id) === selectedPetId);
  }, [petOptions, selectedPetId]);

  const allAppointments: Appointment[] = useMemo(() => {
    return appointments.filter(
      (a) => String(a.pet_id) === String(selectedPetId)
    );
  }, [appointments, selectedPetId]);

  // ✅ คำนวณสถานะใหม่จากเวลา
  const filtered = useMemo(() => {
    const now = new Date();

    return allAppointments.filter((a) => {
      let status = a.status;
        if (status === "Upcoming") {
          // appointment_date may be a full ISO string, extract date part safely
          const datePart = getLocalDateString(new Date(a.appointment_date));
          const [year, month, day] = datePart.split("-").map(Number);
          const [hour, minute] = (a.appointment_time ?? "00:00")
            .split(":")
          .map(Number);

        const appointmentDateTime = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
          0,
          0
        );

        if (appointmentDateTime < now) {
          status = "Completed";
        }
      }

      return status.toLowerCase() === currentTab.toLowerCase();
    });
  }, [allAppointments, currentTab, tick]);

  const grouped = useMemo(() => {
    const map = new Map<string, Appointment[]>();

    for (const a of filtered) {
      const label = formatDateHeader(a.appointment_date);
      map.set(label, [...(map.get(label) ?? []), a]);
    }

    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items
    }));
  }, [filtered]);

  const handleSubmitPopup = async (data: AddAppointmentPayload) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await createAppointment(token, data);
      setShowCreatePopup(false);
      window.location.reload();
    } catch (err) {
      console.error("Failed to create appointment:", err);
    }
  };

  const handleOpenDetail = async (id: string) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      const data = await getAppointmentDetail(token, Number(id));
      setDetail(data);
    } catch (err) {
      console.error("Failed to load appointment detail:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <TopBar
        title="Appointment"
        onBack={() =>
          router.push(`/pet-owners/my-pets-page/${selectedPet?.pet_id}`)
        }
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

      <Tabs data={tabData} queryKey="tab" />

      <div
        key={currentTab}
        className="fade-in"
        style={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 24
        }}
      >
        {grouped.length === 0 ? (
          <div style={{ fontSize: 14, color: "#71717a" }}>
            No appointments
          </div>
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
                    time: a.appointment_time ?? "-",
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
        onClickAction={() => setShowCreatePopup(true)}
      />

      <AddAppointmentPopup
        open={showCreatePopup}
        onClose={() => setShowCreatePopup(false)}
        onSubmit={handleSubmitPopup}
        allPets={pets}
      />

      <AppointmentDetail
        open={!!detail}
        appointment={detail}
        onClose={() => setDetail(null)}
        onEdit={() => setDetail(null)}
        onDelete={() => setDetail(null)}
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