"use client";

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import dayjs from "dayjs";

import { Tabs } from "@/components/pet-owners/shared/Tabs";

import PetFilterSelector, {
  type PetLite,
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
  isoToLocalDate,
  localDateToISO,
} from "@/components/pet-owners/shared/CalendarModule";

import { CALENDAR_MARKER_PALETTE } from "@/styles/calendar.styled";

import RecordDateSection from "@/components/pet-owners/shared/records/RecordDateSection";
import RecordCard from "@/components/pet-owners/shared/records/RecordCard";

import AddRecordPopup from "@/components/pet-owners/shared/records/AddRecordPopup";

import EditRecordPopup, {
  type EditSymptomPayload,
} from "@/components/pet-owners/shared/records/EditRecordPopup";

import RecordDetailPopup, {
  type RecordDetailItem,
} from "@/components/pet-owners/shared/records/RecordDetailPopup";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { mockPets } from "@/mocks/pets.mock";

const RecordPageStyled = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
  position: relative;

  .scroll-area {
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
`;

const recordTabs = [
  { name: "Appointment", path: "/appointment", params: "appointment" },
  { name: "Record", path: "/record", params: "record" },
];

type RecordEntry = {
  id: string;
  dateKey: string; // YYYY-MM-DD
  petId: string;
  time: string; // HH:MM
  note: string;
  images?: string[];
};

// ✅ seed ตัวอย่าง (ผูกกับ mockPets[0] ถ้ามี)
const recordSamples: RecordEntry[] = [
  {
    id: "record-1",
    dateKey: "2026-01-03",
    time: "11:00",
    // 🟢 แก้: .id -> ._id และเพิ่ม optional chaining
    petId: String(mockPets?.[0]?._id ?? "4302459"),
    note: "มีอาการซึมไม่อยากอาหาร\nมีอาเจียนเล็กน้อย",
    images: [
      "/pets-example/pet-ex1.svg",
      "/pets-example/pet-ex1.svg",
      "/pets-example/pet-ex1.svg",
    ],
  },
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime12h(time24: string) {
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;

  const suffix = h >= 12 ? "P.M." : "A.M.";
  const hour12 = ((h + 11) % 12) + 1;
  return `${pad2(hour12)}.${pad2(m)} ${suffix}`;
}

function formatHeaderDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;

  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${weekday}, ${dd}/${mm}/${yyyy}`;
}

// แปลง File[] -> object URL (สำหรับ Add popup)
function filesToObjectUrls(files: File[] | undefined) {
  return (files ?? []).map((f) => URL.createObjectURL(f));
}

export const RecordPage = () => {
  const [records, setRecords] = useState<RecordEntry[]>(recordSamples);

  const [selectedPetId, setSelectedPetId] = useState<PetSelectorValue>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [month, setMonth] = useState<Date>(() => new Date());

  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecordDetailItem | null>(null);
  const [editRecord, setEditRecord] = useState<RecordDetailItem | null>(null);

  /**
   * ✅ petOptions จาก mockPets (แหล่งเดียว)
   * - pid ต้องเป็น string เสมอ (กัน type error ตอนส่งเข้า popup)
   */
  const petOptions: PetLite[] = useMemo(() => {
    // 🟢 แก้: map ให้ตรงกับ field ใหม่ (_id, profile_image)
    return (mockPets ?? []).map((p) => ({
      id: String(p._id),              // แก้ .id -> ._id
      name: p.name ?? "-",
      pid: String(p._id),             // แก้ .pid -> ._id
      avatarUrl: p.profile_image,     // แก้ .imageUrl -> .profile_image
    }));
  }, []);

  const petById = useMemo(() => {
    const m = new Map<string, PetLite>();
    petOptions.forEach((p) => m.set(String(p.id), p));
    return m;
  }, [petOptions]);

  useEffect(() => {
    if (selectedPetId !== "all" && !petOptions.some((p) => p.id === selectedPetId)) {
      setSelectedPetId("all");
    }
  }, [petOptions, selectedPetId]);

  const selectedIso = useMemo(() => localDateToISO(selectedDate), [selectedDate]);

  const filteredByPet = useMemo(() => {
    return records.filter(
      (r) => selectedPetId === "all" || String(r.petId) === String(selectedPetId)
    );
  }, [records, selectedPetId]);

  // ✅ calendar markers: “จุดเดียว”
  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const set = new Set<string>();
    filteredByPet.forEach((r) => set.add(r.dateKey));

    return Array.from(set).map((iso) => {
      const markers: DayMarker[] = [{ type: "dot", colorKey: "record" }];
      return { date: isoToLocalDate(iso), markers };
    });
  }, [filteredByPet]);

  const recordsOnSelectedDate = useMemo(() => {
    return filteredByPet
      .filter((r) => r.dateKey === selectedIso)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredByPet, selectedIso]);

  function openDetailByEntry(entry: RecordEntry) {
    const pet = petById.get(String(entry.petId));

    const detail: RecordDetailItem = {
      id: entry.id,
      petId: entry.petId,
      petName: pet?.name ?? "-",
      petPid: pet?.pid ?? "-", 
      avatarUrl: pet?.avatarUrl,
      date: entry.dateKey,
      time: entry.time,
      note: entry.note,
      imageUrls: entry.images ?? [],
    };

    setDetailRecord(detail);
  }

  function handleDeleteFromDetail(id: string) {
    setRecords((prev) => prev.filter((x) => x.id !== id));
    setDetailRecord(null);
  }

  function handleEditFromDetail(rec: RecordDetailItem) {
    setDetailRecord(null);
    setEditRecord(rec);
  }

  function handleSaveEdit(payload: EditSymptomPayload) {
    setRecords((prev) =>
      prev.map((x) =>
        x.id !== payload.id
          ? x
          : {
              ...x,
              dateKey: payload.date,
              time: payload.time,
              note: payload.note,
              images: payload.imageUrls,
            }
      )
    );
    setEditRecord(null);
  }

  const selectedPet = useMemo(() => {
    if (selectedPetId === "all") return null;
    return petOptions.find((p) => String(p.id) === String(selectedPetId)) ?? null;
  }, [petOptions, selectedPetId]);

  return (
    <RecordPageStyled>
      <div className="scroll-area">
        <Tabs data={recordTabs} queryKey="tab" />

        <PetFilterSelector
          mode="filter"
          allowAllPets
          pets={petOptions}
          value={selectedPetId}
          onChange={setSelectedPetId}
        />

        <CalendarModule
          size="standard"
          weekStart="sun"
          showOutsideDays
          showMarkers
          selectedDate={selectedDate}
          month={month}
          dayMeta={dayMeta}
          maxMarkersPerDay={1}
          markerPalette={CALENDAR_MARKER_PALETTE}
          onSelectDate={(d) => setSelectedDate(d)}
          onMonthChange={(m) => setMonth(m)}
          variant="card"
        />

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="font-semibold text-zinc-900">Record</div>
            <div className="text-sm text-zinc-800 border-b border-zinc-200 pb-2">
              {formatHeaderDate(selectedIso)}
            </div>
          </div>

          {recordsOnSelectedDate.length === 0 ? (
            <div className="text-sm text-zinc-500">No records</div>
          ) : (
            <RecordDateSection label="">
              {recordsOnSelectedDate.map((record) => {
                const pet = petById.get(String(record.petId));

                return (
                  <RecordCard
                    key={record.id}
                    petName={pet?.name ?? "-"}
                    time={formatTime12h(record.time)}
                    note={record.note}
                    avatarUrl={pet?.avatarUrl} 
                    imageUrls={record.images ?? []}
                    onClick={() => openDetailByEntry(record)}
                  />
                );
              })}
            </RecordDateSection>
          )}
        </div>
      </div>

      {/* FAB */}
      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={() => setOpenCreate(true)}
      />

      {/* Create (shared) */}
      {selectedPetId !== "all" && selectedPet ? (
        <AddRecordPopup
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          pet={{
            id: selectedPet.id,
            name: selectedPet.name ?? "-",
            pid: selectedPet.pid ?? String(selectedPet.id), // ✅ string ชัวร์
            avatarUrl: selectedPet.avatarUrl,
          }}
          onSubmit={(data: any) => {
            const petIdFromForm = String(data.petId ?? selectedPet.id);

            const next: RecordEntry = {
              id: `record-${Date.now()}`,
              petId: petIdFromForm,
              dateKey: String(data.date ?? dayjs().format("YYYY-MM-DD")),
              time: String(data.time ?? "00:00"),
              note: String(data.note ?? "").trim(),
              images: filesToObjectUrls(data.images),
            };

            // กันซ้ำ slot (pet+date+time)
            setRecords((prev) => {
              const dup = prev.some(
                (x) =>
                  String(x.petId) === String(next.petId) &&
                  x.dateKey === next.dateKey &&
                  x.time === next.time
              );
              if (dup) return prev;
              return [next, ...prev];
            });

            setOpenCreate(false);
          }}
        />
      ) : null}

      {/* Detail (shared) */}
      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => rec && handleEditFromDetail(rec)}
        onDelete={(id) => handleDeleteFromDetail(id)}
        formatTime={(t: string) => t}
      />

      {/* Edit (shared) */}
      <EditRecordPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleSaveEdit}
        maxImages={4}
      />
    </RecordPageStyled>
  );
};