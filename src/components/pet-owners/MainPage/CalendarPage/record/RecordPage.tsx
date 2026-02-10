"use client";

import { useMemo, useState } from "react";

import { Page } from "@/styles/components/calendar.styled";

import {
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
  isoToLocalDate,
  localDateToISO,
} from "@/components/pet-owners/shared/CalendarModule";

import { CALENDAR_MARKER_PALETTE } from "@/styles/components/calendar.styled";

import RecordCard from "@/components/pet-owners/shared/records/RecordCard";
import AddRecordPopup, { type AddSymptomPayload } from "./AddRecordPopup";
import EditRecordPopup, { type EditSymptomPayload } from "@/components/pet-owners/shared/records/EditRecordPopup";
import RecordDetailPopup, { type RecordDetailItem } from "@/components/pet-owners/shared/records/RecordDetailPopup";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { Pet, PetLite } from "@/types/domain/pet";
import { usePets } from "@/hooks/usePets";
import { useSymptomRecords } from "@/hooks/useSymptomRecords";

// API
import {
  createSymptomRecord,
  editSymptomRecord,
  deleteSymptomRecord,
  authStorage,
} from "@/services/api/client";
import SectionError from "@/components/pet-owners/shared/SectionError";

/* ---------------- helpers ---------------- */
function pad2(n: number) { return String(n).padStart(2, "0"); }

function formatTime12h(time24: string) {
  if (!time24) return "";
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

/* ================= page ================= */
export const RecordPage = ({
  selectedPetId = "all",
}: {
  selectedPetId?: PetSelectorValue;
}) => {
  const { records, error, refetch } = useSymptomRecords(selectedPetId);

  // Removed local selectedPetId state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecordDetailItem | null>(null);
  const [editRecord, setEditRecord] = useState<RecordDetailItem | null>(null);

  const { pets } = usePets();

  const petOptions: PetLite[] = useMemo(() => {
    return (pets ?? []).map((p: Pet) => ({
      pet_id: p.pet_id,
      name: p.name ?? "-",
      profile_image: p.profile_image,
    }));
  }, [pets]);

  const petById = useMemo(() => {
    const m = new Map<string, PetLite>();
    petOptions.forEach((p) => m.set(p.pet_id, p));
    return m;
  }, [petOptions]);

  const selectedIso = useMemo(() => localDateToISO(selectedDate), [selectedDate]);

  const filteredByPet = useMemo(() => {
    // If we fetched with petId filtering, records are already filtered.
    // But if selectedPetId changes, we re-fetch.
    // However, for immediate UI feedback if we wanted client side filtering:
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
  const handleSaveAdd = async (data: AddSymptomPayload) => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const fullDateISO = `${data.date}T${data.time}:00.000Z`;

      await createSymptomRecord(token, {
        pet_id: Number(data.petId),
        note: data.note,
        note_image: data.images, // Already uploaded URLs
      });

      await refetch();
      setOpenCreate(false);
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create record");
    }
  };

  const handleSaveEdit = async (payload: EditSymptomPayload) => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const finalImages = [...payload.existingImages, ...payload.newImages];
      const fullDateISO = `${payload.date}T${payload.time}:00.000Z`;

      await editSymptomRecord(token, payload.id, {
        note: payload.note,
        note_image: finalImages,
        // symptom: ... // reuse existing or update? API updates partial.
      });

      await refetch();
      setEditRecord(null);
    } catch (err) {
      console.error("Edit failed", err);
      alert("Failed to update record");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Are you sure?")) return;
      const token = authStorage.getToken();
      if (!token) return;

      await deleteSymptomRecord(token, id);
      await refetch();
      setDetailRecord(null);

    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete record");
    }
  }

  return (
    <Page>
      <div className="scroll-area">
        {/* Removed local PetFilterSelector */}

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

        <div className="head-text">Record</div>

        {error ? (
          <div className="mt-4">
            <SectionError message="Failed to load symptom records" onRetry={refetch} />
          </div>
        ) : (
          recordsOnSelectedDate.length === 0 ? (
            <div className="mt-8 text-center text-gray-400 text-sm">
              No records on this date
            </div>
          ) : (
            <>
              <div className="date-text">{formatHeaderDate(selectedIso)}</div>
              <div className="line" />

              {recordsOnSelectedDate.map((record) => {
                const pet = petById.get(String(record.petId));
                return (
                  <RecordCard
                    key={record.id}
                    petName={pet?.name ?? "-"}
                    time={formatTime12h(record.time)}
                    note={record.note}
                    avatarUrl={pet?.profile_image ?? undefined}
                    imageUrls={record.images ?? []}
                    onClick={() => {
                      setDetailRecord({
                        ...record,
                        petName: pet?.name ?? "-",
                        petPid: pet?.pet_id ?? "-",
                        avatarUrl: pet?.profile_image ?? undefined,
                        date: record.dateKey,
                        imageUrls: record.images ?? [],
                      });
                    }}
                  />
                );
              })}
            </>
          )
        )}
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
        onEdit={(rec) => { setDetailRecord(null); setEditRecord(rec); }}
        onDelete={handleDelete}
        formatTime={(t: string) => formatTime12h(t)} // Format 24h to 12h for detail view
      />
    </Page>
  );
};