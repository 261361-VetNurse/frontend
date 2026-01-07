"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PetSelectorCard from "@/components/pet-owners/MainPage/MyPetsPage/PetSelectorCard";
import MedicalDateSection from "./MedicalDateSection";
import MedicalItem from "./MedicalItem";
import AddMedicalPopup, { type AddMedicalPayload } from "./AddMedicalPopup";
import { MedicalFab } from "./AddMedicalPopup";

import { mockPetInformationById } from "@/mocks/petInformation";
import TopBar from "@/components/pet-owners/layout/TopBar";

type PetOption = {
  id: string;
  name: string;
  pid: string;
  imageUrl?: string;
};

export type MedicalRecord = {
  id: string;
  petId: string;
  date: string;
  time: string;
  note: string;
};

function formatHeaderDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

function formatTimeTH(time24: string) {
  const [h, m] = time24.split(":");
  return `${h}.${m} น.`;
}

const mockMedicalSeed: MedicalRecord[] = [
  { id: "med-001", petId: "4302459", date: "2025-12-17", time: "10:52", note: "เข้าห้องตรวจ" },
  { id: "med-002", petId: "4302459", date: "2025-12-17", time: "11:02", note: "ฉีดยา" },
  { id: "med-003", petId: "4302459", date: "2025-12-17", time: "11:15", note: "เรียกรับยา" },
  { id: "med-004", petId: "4302459", date: "2025-12-16", time: "11:20", note: "เรียกรับยา" },
];

export default function Medical() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const petOptions: PetOption[] = useMemo(() => {
    return Object.values(mockPetInformationById).map((p) => ({
      id: p.header.id,
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
    const exists = petOptions.some((p) => p.id === String(petId));
    if (exists) setSelectedPetId(String(petId));
  }, [petId, petOptions]);

  const selectedPet =
    petOptions.find((p) => p.id === selectedPetId) ?? petOptions[0];

  const [records, setRecords] = useState<MedicalRecord[]>(mockMedicalSeed);
  const [openCreate, setOpenCreate] = useState(false);

  const [editingDate, setEditingDate] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return records.filter((r) => r.petId === selectedPetId);
  }, [records, selectedPetId]);

  const grouped = useMemo(() => {
    const map = new Map<string, MedicalRecord[]>();

    for (const r of filtered) {
      map.set(r.date, [...(map.get(r.date) ?? []), r]);
    }

    const dates = Array.from(map.keys()).sort((a, b) => (a < b ? 1 : -1));

    return dates.map((date) => ({
      date,
      label: formatHeaderDate(date),
      items: (map.get(date) ?? []).slice().sort((a, b) => (a.time < b.time ? -1 : 1)),
    }));
  }, [filtered]);

  function handleAddMedical(data: AddMedicalPayload) {
    const newItem: MedicalRecord = {
      id: `med-${Date.now()}`,
      petId: data.petId,
      date: data.date,
      time: data.time,
      note: data.note,
    };
    setRecords((prev) => [newItem, ...prev]);
  }

  function handleDelete(id: string) {
    setRecords((prev) => prev.filter((x) => x.id !== id));
  }

  function toggleEdit(date: string) {
    setEditingDate((cur) => (cur === date ? null : date));
  }

  return (
    <>
      <TopBar title="Medical History" onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.id}`)} />

      {/* Petss selector */}
      <div className="mt-4">
        <PetSelectorCard
          name={selectedPet?.name ?? "-"}
          pid={selectedPet?.pid ?? "-"}
          imageUrl={selectedPet?.imageUrl}
          options={petOptions}
          selectedId={selectedPetId}
          onSelect={(id) => {
            setSelectedPetId(id);
            setEditingDate(null); 
            router.push(`/pet-owners/my-pets-page/${id}/medical`);
          }}
        />
      </div>

      {/* List */}
      <div className="mt-6 space-y-6">
        {grouped.length === 0 ? (
          <div className="text-sm text-zinc-500">No medical history</div>
        ) : (
          grouped.map((sec) => {
            const editing = editingDate === sec.date;

            return (
              <MedicalDateSection
                key={sec.date}
                label={sec.label}
                editing={editing}
                onToggleEdit={() => toggleEdit(sec.date)}
                editIconSrc="/edit.svg"
              >
                {sec.items.map((item) => (
                  <MedicalItem
                    key={item.id}
                    time={formatTimeTH(item.time)}
                    note={item.note}
                    showDelete={editing}
                    onDelete={() => handleDelete(item.id)}
                    deleteIconSrc="/delete.svg"
                  />
                ))}
              </MedicalDateSection>
            );
          })
        )}
      </div>

      {/* FAB */}
      <MedicalFab onClick={() => setOpenCreate(true)} />

      {/* Add popup */}
      {selectedPet && (
        <AddMedicalPopup
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          pet={{
            id: selectedPet.id,
            name: selectedPet.name,
            pid: selectedPet.pid,
            avatarUrl: selectedPet.imageUrl,
          }}
          onSubmit={(data) => {
            handleAddMedical(data);
            setOpenCreate(false);
          }}
        />
      )}
    </>
  );
}
