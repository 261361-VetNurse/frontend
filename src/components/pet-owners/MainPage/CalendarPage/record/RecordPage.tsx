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
import AddRecordPopup, { type  AddSymptomPayload } from "./AddRecordPopup";
import EditRecordPopup, { type EditSymptomPayload } from "@/components/pet-owners/shared/records/EditRecordPopup";
import RecordDetailPopup, { type RecordDetailItem } from "@/components/pet-owners/shared/records/RecordDetailPopup";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { mockPets } from "@/mocks/pets.mock";
import { Pet } from "@/types/pet";

/* ---------------- styled ---------------- */
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
  dateKey: string;
  petId: string;
  time: string;
  note: string;
  images?: string[];
};

const recordSamples: RecordEntry[] = [
  {
    id: "record-1",
    dateKey: "2026-01-03",
    time: "11:00",
    petId: String(mockPets?.[0]?._id ?? "4302459"),
    note: "มีอาการซึมไม่อยากอาหาร\nมีอาเจียนเล็กน้อย",
    images: ["/pets-example/pet-ex1.svg"],
  },
];

/* ---------------- helpers ---------------- */
function pad2(n: number) { return String(n).padStart(2, "0"); }

function formatTime12h(time24: string) {
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return time24;
  const suffix = h >= 12 ? "P.M." : "A.M.";
  const hour12 = ((h + 11) % 12) + 1;
  return `${pad2(hour12)}.${pad2(m)} ${suffix}`;
}

function formatHeaderDate(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (isNaN(d.getTime())) return isoDate;
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday}, ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function filesToObjectUrls(files: File[] | undefined) {
  return (files ?? []).map((f) => URL.createObjectURL(f));
}

/* ================= page ================= */
export const RecordPage = () => {
  const [records, setRecords] = useState<RecordEntry[]>(recordSamples);
  const [selectedPetId, setSelectedPetId] = useState<PetSelectorValue>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecordDetailItem | null>(null);
  const [editRecord, setEditRecord] = useState<RecordDetailItem | null>(null);

  const petOptions: PetLite[] = useMemo(() => {
    return (mockPets ?? []).map((p: Pet) => ({
      id: String(p._id),
      name: p.name ?? "-",
      pid: String(p._id),
      avatarUrl: p.profile_image,
    }));
  }, []);

  const petById = useMemo(() => {
    const m = new Map<string, PetLite>();
    petOptions.forEach((p) => m.set(p.id, p));
    return m;
  }, [petOptions]);

  const selectedIso = useMemo(() => localDateToISO(selectedDate), [selectedDate]);

  const filteredByPet = useMemo(() => {
    return records.filter(
      (r) => selectedPetId === "all" || String(r.petId) === String(selectedPetId)
    );
  }, [records, selectedPetId]);

  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const set = new Set<string>();
    filteredByPet.forEach((r) => set.add(r.dateKey));
    return Array.from(set).map((iso) => ({
      date: isoToLocalDate(iso),
      markers: [{ type: "dot", colorKey: "record" } as DayMarker],
    }));
  }, [filteredByPet]);

  const recordsOnSelectedDate = useMemo(() => {
    return filteredByPet
      .filter((r) => r.dateKey === selectedIso)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredByPet, selectedIso]);

  /* -------- handlers -------- */
  const handleSaveAdd = (data: AddSymptomPayload) => {
    const next: RecordEntry = {
      id: `record-${Date.now()}`,
      petId: data.petId,
      dateKey: data.date,
      time: data.time,
      note: data.note,
      images: filesToObjectUrls(data.images),
    };

    setRecords((prev) => [next, ...prev]);
    setOpenCreate(false);
  };

  const handleSaveEdit = (payload: EditSymptomPayload) => {
    setRecords((prev) =>
      prev.map((x) =>
        x.id !== payload.id
          ? x
          : {
            ...x,
            petId: payload.petId, // อัปเดต petId กรณีเปลี่ยนตัวสัตว์เลี้ยง
            dateKey: payload.date,
            time: payload.time,
            note: payload.note,
            images: payload.imageUrls,
          }
      )
    );
    setEditRecord(null);
  };

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
          onSelectDate={setSelectedDate}
          onMonthChange={setMonth}
          variant="card"
        />

        <div className="mt-4 space-y-4 px-1">
          <div className="space-y-2">
            <div className="font-semibold text-zinc-900 text-lg">Record</div>
            <div className="text-sm text-zinc-500 border-b border-zinc-100 pb-2 font-medium">
              {formatHeaderDate(selectedIso)}
            </div>
          </div>

          {recordsOnSelectedDate.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-400">No records on this date</div>
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
                    onClick={() => {
                      setDetailRecord({
                        ...record,
                        petName: pet?.name ?? "-",
                        petPid: pet?.pid ?? "-",
                        avatarUrl: pet?.avatarUrl,
                        date: record.dateKey,
                        imageUrls: record.images ?? [],
                      });
                    }}
                  />
                );
              })}
            </RecordDateSection>
          )}
        </div>
      </div>

      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={() => setOpenCreate(true)}
      />

      <AddRecordPopup
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        pets={petOptions}
        initialPetId={selectedPetId !== "all" ? String(selectedPetId) : undefined}
        onSubmit={handleSaveAdd}
      />

      {/* Edit (shared) */}
      <EditRecordPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleSaveEdit}
        maxImages={4}
      />

      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => rec && setEditRecord(rec)}
        onDelete={(id) => {
          setRecords((prev) => prev.filter((x) => x.id !== id));
          setDetailRecord(null);
        }}
        formatTime={(t: string) => t}
      />
    </RecordPageStyled>
  );
};