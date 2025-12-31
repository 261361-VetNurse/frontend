"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import PetInfoTopBar from "@/components/pet-owners/mypets/pet-info/PetInfoTopBar";
import PetSelectorCard from "@/components/pet-owners/mypets/PetSelectorCard";

import SymptomCalendar from "@/components/pet-owners/symptoms/SymptomCalendar";
import SymptomDateSection from "@/components/pet-owners/symptoms/SymptomDateSection";
import SymptomCard from "@/components/pet-owners/symptoms/SymptomCard";
import AddSymptomPopup, { SymptomFab } from "@/components/pet-owners/symptoms/AddSymptomPopup";

import { mockPetInformationById } from "@/mocks/petInformation";

type PetOption = {
  id: string;
  name: string;
  pid: string;
  imageUrl?: string;
};

export type SymptomRecordItem = {
  id: string;
  petId: string;
  petName: string;
  petPid: string;
  avatarUrl?: string;

  date: string; 
  time: string; 
  note: string;

  imageCount?: number; 
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatHeaderDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

function formatTime12h(time24: string) {
  // "11:00" -> "11.00 A.M."
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;

  const suffix = h >= 12 ? "P.M." : "A.M.";
  const hour12 = ((h + 11) % 12) + 1;
  return `${String(hour12).padStart(2, "0")}.${String(m).padStart(2, "0")} ${suffix}`;
}

const mockSymptoms: SymptomRecordItem[] = [
  {
    id: "sym-001",
    petId: "4302459",
    petName: "Lee",
    petPid: "4302459",
    avatarUrl: "/pets-example/pet-ex1.svg",
    date: "2025-12-17",
    time: "11:00",
    note: "มีอาการซึมไม่อยากอาหาร มีอาเจียนเล็กน้อย",
    imageCount: 3,
  },
  {
    id: "sym-002",
    petId: "430587",
    petName: "Tom",
    petPid: "430587",
    avatarUrl: "/pets-example/pet-ex1.svg",
    date: "2025-12-17",
    time: "09:30",
    note: "เกาไม่หยุดบริเวณคอ อาจแพ้/ระคายเคือง",
    imageCount: 0,
  },
];

export default function SymptomRecord() {
  const router = useRouter();

  const petOptions: PetOption[] = useMemo(() => {
    return Object.values(mockPetInformationById).map((p) => ({
      id: p.header.id,
      name: p.header.name,
      pid: p.header.pid,
      imageUrl: p.header.avatarUrl,
    }));
  }, []);

  const [selectedPetId, setSelectedPetId] = useState<string>(
    petOptions[0]?.id ?? ""
  );

  const selectedPet =
    petOptions.find((p) => p.id === selectedPetId) ?? petOptions[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [openCreate, setOpenCreate] = useState(false);

  // filter by pet + date
  const filtered = useMemo(() => {
    return mockSymptoms.filter((r) => {
      const okPet = !selectedPetId || r.petId === selectedPetId;
      const okDate = !selectedDate || r.date === selectedDate;
      return okPet && okDate;
    });
  }, [selectedPetId, selectedDate]);

  // group by date label (เผื่ออนาคตเลือกหลายวัน/หรือแสดง list หลายวัน)
  const grouped = useMemo(() => {
    const map = new Map<string, SymptomRecordItem[]>();
    for (const r of filtered) {
      const label = formatHeaderDate(r.date);
      map.set(label, [...(map.get(label) ?? []), r]);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
  }, [filtered]);

  return (
    <div className="pb-24">
      <PetInfoTopBar title="Pet Symptom Record" onBack={() => router.back()} />

      {/* Pet selector */}
      <div className="px-4 mt-4">
        <PetSelectorCard
          name={selectedPet?.name ?? "-"}
          pid={selectedPet?.pid ?? "-"}
          imageUrl={selectedPet?.imageUrl}
          options={petOptions}
          selectedId={selectedPetId}
          onSelect={(id) => setSelectedPetId(id)}
        />
      </div>

      {/* Calendar */}
      <div className="px-4 mt-4">
        <SymptomCalendar value={selectedDate} onChange={setSelectedDate} />
      </div>

      {/* List */}
      <div className="px-4 mt-4 space-y-6">
        <div className="font-semibold text-zinc-900">Today record</div>

        {grouped.length === 0 ? (
          <div className="text-sm text-zinc-500">No records</div>
        ) : (
          grouped.map((sec) => (
            <SymptomDateSection key={sec.label} label={sec.label}>
              {sec.items.map((r) => (
                <SymptomCard
                  key={r.id}
                  petName={r.petName}
                  note={r.note}
                  time={formatTime12h(r.time)}
                  avatarUrl={r.avatarUrl}
                  imageCount={r.imageCount ?? 0}
                  onClick={() => console.log("open detail", r.id)}
                />
              ))}
            </SymptomDateSection>
          ))
        )}
      </div>

      {/* FAB */}
      <SymptomFab onClick={() => setOpenCreate(true)} />

      {/* Create Popup */}
      {selectedPet && (
        <AddSymptomPopup
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          pet={{
            id: selectedPet.id,
            name: selectedPet.name,
            pid: selectedPet.pid,
            avatarUrl: selectedPet.imageUrl,
          }}
          onSubmit={(data) => {
            console.log("submit symptom", data);
            setOpenCreate(false);
          }}
        />
      )}
    </div>
  );
}
