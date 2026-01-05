"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PetSelectorCard from "@/components/pet-owners/MainPage/MyPetsPage/PetSelectorCard";
import SymptomCalendar from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/SymptomCalendar";
import SymptomDateSection from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/SymptomDateSection";
import SymptomCard from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/SymptomCard";
import AddSymptomPopup, { SymptomFab } from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/AddSymptomPopup";
import SymptomDetailPopup, { type SymptomDetailRecord } from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/SymptomDetailPopup";
import EditSymptomPopup, { type EditSymptomPayload } from "@/components/pet-owners/MainPage/MyPetsPage/symptoms/EditSymptomPopup";
import { mockPetInformationById } from "@/mocks/petInformation";
import TopBar from "@/components/pet-owners/layout/TopBar";

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

  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  note: string;
  imageUrls?: string[];
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isTodayISO(isoDate: string) {
  return isoDate === todayISO();
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
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;

  const suffix = h >= 12 ? "P.M." : "A.M.";
  const hour12 = ((h + 11) % 12) + 1;
  return `${String(hour12).padStart(2, "0")}.${String(m).padStart(
    2,
    "0"
  )} ${suffix}`;
}

function formatTime12hFrom24(time24: string) {
  return formatTime12h(time24);
}

const mockSymptomsSeed: SymptomRecordItem[] = [
  {
    id: "sym-001",
    petId: "4302459",
    petName: "Lee",
    petPid: "4302459",
    avatarUrl: "/pets-example/pet-ex1.svg",
    date: "2025-12-17",
    time: "11:00",
    note: "มีอาการซึมไม่อยากอาหาร มีอาเจียนเล็กน้อย",
    imageUrls: [
      "/pets-example/pet-ex1.svg",
      "/pets-example/pet-ex1.svg",
      "/pets-example/pet-ex1.svg",
      "/pets-example/pet-ex1.svg",
    ],
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
    imageUrls: [],
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

  const { petId } = useParams<{ petId: string }>();

  const [selectedPetId, setSelectedPetId] = useState<string>(
    String(petId ?? petOptions[0]?.id ?? "")
  );

  useEffect(() => {
    if (!petId) return;
    const idFromUrl = String(petId);
    const exists = petOptions.some((p) => String(p.id) === idFromUrl);
    if (exists) setSelectedPetId(idFromUrl);
  }, [petId, petOptions]);

  const selectedPet =
    petOptions.find((p) => p.id === selectedPetId) ?? petOptions[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [symptoms, setSymptoms] = useState<SymptomRecordItem[]>(
    mockSymptomsSeed
  );

  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SymptomDetailRecord | null>(
    null
  );
  const [editRecord, setEditRecord] = useState<SymptomDetailRecord | null>(null);

  // วันที่ที่มี record ของ pet ที่เลือก
  const markedDates = useMemo(() => {
    const set = new Set<string>();
    for (const r of symptoms) {
      if (!selectedPetId || r.petId === selectedPetId) set.add(r.date);
    }
    return Array.from(set);
  }, [symptoms, selectedPetId]);

  // หัวข้อด้านบน: Today record เฉพาะ "วันนี้จริง"
  const listTitle = useMemo(() => {
    return isTodayISO(selectedDate) ? "Today record" : "Record";
  }, [selectedDate]);

  // ถ้าไม่ใช่วันนี้ ให้โชว์วันที่ที่เลือกเป็นบรรทัดบน
  const headerDateLine = useMemo(() => {
    return isTodayISO(selectedDate) ? null : formatHeaderDate(selectedDate);
  }, [selectedDate]);

  // filter by pet + selected date
  const filtered = useMemo(() => {
    return symptoms
      .filter((r) => {
        const okPet = !selectedPetId || r.petId === selectedPetId;
        const okDate = !selectedDate || r.date === selectedDate;
        return okPet && okDate;
      })
      // (optional) เรียงเวลา
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [symptoms, selectedPetId, selectedDate]);

  function openDetailById(id: string) {
    const found = symptoms.find((x) => x.id === id);
    if (!found) return;

    const detail: SymptomDetailRecord = {
      id: found.id,
      petId: found.petId,
      petName: found.petName,
      petPid: found.petPid,
      avatarUrl: found.avatarUrl,
      date: found.date,
      time: found.time,
      note: found.note,
      imageUrls: found.imageUrls ?? [],
    };

    setDetailRecord(detail);
  }

  function handleEditFromDetail(rec: SymptomDetailRecord) {
    setDetailRecord(null);
    setEditRecord(rec);
  }

  function handleDeleteFromDetail(id: string) {
    setSymptoms((prev) => prev.filter((x) => x.id !== id));
    setDetailRecord(null);
  }

  function handleSaveEdit(payload: EditSymptomPayload) {
    setSymptoms((prev) =>
      prev.map((x) => {
        if (x.id !== payload.id) return x;
        return {
          ...x,
          date: payload.date,
          time: payload.time,
          note: payload.note,
          imageUrls: payload.imageUrls,
        };
      })
    );
    setEditRecord(null);
  }

  return (
    <>
      <TopBar title="Pet Symptom Record" onBack={() => router.back()} />

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
        <SymptomCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          markedDates={markedDates}
        />
      </div>

      {/* List */}
      <div className="px-4 mt-4 space-y-4">
        <div className="space-y-2">
          <div className="font-semibold text-zinc-900">{listTitle}</div>

          {headerDateLine && (
            <div className="text-sm text-zinc-800 border-b border-zinc-200 pb-2">
              {headerDateLine}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-zinc-500">No records</div>
        ) : (
          <SymptomDateSection label={headerDateLine ? "" : formatHeaderDate(selectedDate)}>
            {filtered.map((r) => (
              <SymptomCard
                key={r.id}
                petName={r.petName}
                note={r.note}
                time={formatTime12h(r.time)}
                avatarUrl={r.avatarUrl}
                imageUrls={r.imageUrls ?? []}
                onClick={() => openDetailById(r.id)}
              />
            ))}
          </SymptomDateSection>
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
            const newItem: SymptomRecordItem = {
              id: `sym-${String(Date.now())}`,
              petId: data.petId,
              petName: selectedPet.name,
              petPid: selectedPet.pid,
              avatarUrl: selectedPet.imageUrl,
              date: data.date,
              time: data.time,
              note: data.note,
              imageUrls: (data.images ?? []).map((f) => URL.createObjectURL(f)),
            };
            setSymptoms((prev) => [newItem, ...prev]);
            setOpenCreate(false);
          }}
        />
      )}

      {/* Detail Popup */}
      <SymptomDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => rec && handleEditFromDetail(rec)}
        onDelete={(id) => handleDeleteFromDetail(id)}
        formatTime={(t: string) => formatTime12hFrom24(t)}
      />

      {/* Edit Popup */}
      <EditSymptomPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleSaveEdit}
        maxImages={4}
      />
    </>
  );
}
