"use client";

import { useMemo, useState } from "react";

import { Page } from "@/styles/components/calendar.styled";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
  isoToLocalDate,
  localDateToISO,
} from "@/components/pet-owners/shared/CalendarModule";

import { CALENDAR_MARKER_PALETTE } from "@/styles/components/calendar.styled";

import RecordCard from "@/components/pet-owners/shared/records/RecordCard";
import AddRecordPopup from "./AddRecordPopup";
import { AddSymptomPayload as AddSymptomPayloadDTO } from "@/types/api/record.dto";
import EditRecordPopup, { type EditRecordFormState } from "@/components/pet-owners/shared/records/EditRecordPopup";
import RecordDetailPopup from "@/components/pet-owners/shared/records/RecordDetailPopup";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { Pet, PetLite } from "@/types/domain/pet";
import { useSymptomRecords } from "@/hooks/useSymptomRecords";

// API
import {
  createSymptomRecord,
  editSymptomRecord,
  deleteSymptomRecord,
  authStorage,
} from "@/services/api/client";
import SectionError from "@/components/pet-owners/shared/SectionError";
import { SymptomRecord } from "@/types/domain/symptom";

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
  selectedPetId = null,
  allPets,
}: {
  selectedPetId?: number | null;
  allPets: Pet[];
}) => {
  const { records, error, refetch } = useSymptomRecords(selectedPetId);

  // Removed local selectedPetId state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<SymptomRecord | null>(null);
  const [editRecord, setEditRecord] = useState<SymptomRecord | null>(null);

  const petOptions: PetLite[] = useMemo(() => {
    return (allPets ?? []).map((p: Pet) => ({
      pet_id: p.pet_id,
      name: p.name ?? "-",
      profile_image: p.profile_image,
    }));
  }, [allPets]);

  const petById = useMemo(() => {
    const m = new Map<number, PetLite>();
    petOptions.forEach((p) => m.set(p.pet_id, p));
    return m;
  }, [petOptions]);

  const selectedIso = useMemo(() => localDateToISO(selectedDate), [selectedDate]);

  const filteredByPet = useMemo(() => {
    // If we fetched with petId filtering, records are already filtered.
    // But if selectedPetId changes, we re-fetch.
    // However, for immediate UI feedback if we wanted client side filtering:
    return records.filter(
      (r) => selectedPetId === 0 || r.pet_id === selectedPetId
    );
  }, [records, selectedPetId]);

  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const set = new Set<string>();
    filteredByPet.forEach((r) => {
      if (r.date_added) set.add(r.date_added);
    });
    return Array.from(set).map((iso) => ({
      date: isoToLocalDate(iso),
      markers: [{ type: "dot", colorKey: "record" } as DayMarker],
    }));
  }, [filteredByPet]);

  const recordsOnSelectedDate = useMemo(() => {
    return filteredByPet
      .filter((r) => r.date_added === selectedIso)
      .sort((a, b) => a.time_added.localeCompare(b.time_added));
  }, [filteredByPet, selectedIso]);

  /* -------- handlers -------- */
  const handleSaveAdd = async (data: AddSymptomPayloadDTO) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await createSymptomRecord(token, data);

      await refetch();
      setOpenCreate(false);
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  const handleSaveEdit = async (record_id: number, payload: EditRecordFormState) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      const finalImages = [...payload.existingImages, ...payload.newImages];

      await editSymptomRecord(token, record_id, {
        note: payload.note,
        note_image: finalImages,
      });

      await refetch();
      setEditRecord(null);
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!confirm("Are you sure?")) return;
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await deleteSymptomRecord(token, id);
      await refetch();
      setDetailRecord(null);

    } catch (err) {
      console.error("Delete failed", err);
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
                const pet = petById.get(record.pet_id);
                return (
                  <RecordCard
                    key={record.record_id}
                    petName={pet?.name ?? "-"}
                    time={formatTime12h(record.time_added)}
                    note={record.note}
                    avatarUrl={pet?.profile_image ?? undefined}
                    imageUrls={record.note_image ?? []}
                    onClick={() => {
                      setDetailRecord(record);
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
        initialPetId={selectedPetId}
        onSubmit={handleSaveAdd}
      />

      {/* Edit (shared) */}
      <EditRecordPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={(record_id: number, payload: EditRecordFormState) => handleSaveEdit(record_id, payload)}
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