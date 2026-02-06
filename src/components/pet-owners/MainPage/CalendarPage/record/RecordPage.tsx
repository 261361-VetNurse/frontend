"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

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

// API
import {
  getSymptomRecordsCalendar,
  createSymptomRecord,
  editSymptomRecord,
  deleteSymptomRecord,
  uploadImage,
  authStorage
} from "@/services/api/client";
import { SymptomRecord } from "@/types/domain/symptom";

type RecordEntry = {
  id: string;
  dateKey: string;
  petId: string;
  time: string;
  note: string;
  images?: string[];
};

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

function extractTimeFromISO(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* ================= page ================= */
export const RecordPage = ({
  selectedPetId = "all",
}: {
  selectedPetId?: PetSelectorValue;
}) => {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  // Removed local selectedPetId state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecordDetailItem | null>(null);
  const [editRecord, setEditRecord] = useState<RecordDetailItem | null>(null);

  const { pets } = usePets();

  const petOptions: PetLite[] = useMemo(() => {
    return (pets ?? []).map((p: Pet) => ({
      _id: String(p._id),
      name: p.name ?? "-",
      profile_image: p.profile_image,
    }));
  }, [pets]);

  const petById = useMemo(() => {
    const m = new Map<string, PetLite>();
    petOptions.forEach((p) => m.set(p._id, p));
    return m;
  }, [petOptions]);

  const selectedIso = useMemo(() => localDateToISO(selectedDate), [selectedDate]);

  // Fetch Logic
  const fetchRecords = useCallback(async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const pId = selectedPetId === "all" ? undefined : String(selectedPetId);
      // Currently API returns filtered by date? No, returns calendar map.
      // But let's assume getSymptomRecordsCalendar returns ALL records for client to filter for now 
      // OR we might want to fetch by range. The mock returns all.
      const response = await getSymptomRecordsCalendar(token, pId);

      // Flatten the response
      const allRecords = Object.values(response).flat();

      // Map to RecordEntry
      const entries: RecordEntry[] = allRecords.map(r => ({
        id: r._id,
        dateKey: r.date,
        petId: r.pet_id,
        time: extractTimeFromISO(r.created_at), // Using created_at time as default if no specific time field in SymptomRecord?
        // Wait, SymptomRecord doesn't have `time` field in type def?
        // Let's check type definition in step 40.
        // It has `date` (string). It does NOT have `time` separate field.
        // But UI expects `time`.
        // I should probably store `time` in `date` (as ISO full) or add `time` to schema?
        // UI uses `date` = YYYY-MM-DD and `time` = HH:MM separately.
        // Reviewing Type: date: string.
        // I will assume `date` field in API holds YYYY-MM-DD.
        // Where to store time? user selects time.
        // Created_at will be set to Now.
        // I should probably update `SymptomRecord` to include `time` or store it in `note`?
        // Or assume `date` stores full ISO?
        // Step 40: `date: string; // ISO 8601 date string (YYYY-MM-DD or full timestamp)`
        // If I store full timestamp in `date`, I can extract both.
        // Let's try to store "YYYY-MM-DDTHH:mm:00.000Z" in `date`.
        note: r.note || "",
        images: r.images
      }));

      // Update: If entries come from API, the time needs to be correct.
      // If I save full ISO in `date`, retrieving it:
      // r.date might be "2026-01-01T10:00:00.000Z"
      // dateKey = "2026-01-01"
      // time = "10:00"

      // Fix mapping:
      const mapped = allRecords.map(r => {
        const d = new Date(r.date);
        const dateKey = r.date.includes('T') ? r.date.split('T')[0] : r.date;
        const time = r.date.includes('T') ? extractTimeFromISO(r.date) : "00:00";

        return {
          id: r._id,
          dateKey: dateKey,
          petId: r.pet_id,
          time: time,
          note: r.note || "",
          images: r.images
        };
      });

      setRecords(mapped);

    } catch (err) {
      console.error("Failed to fetch records", err);
    }
  }, [selectedPetId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);


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

      // Upload images
      const imageUrls: string[] = [];
      if (data.images && data.images.length > 0) {
        const uploadPromises = data.images.map(file => uploadImage(file, token));
        const results = await Promise.all(uploadPromises);
        imageUrls.push(...results);
      }

      const fullDateISO = `${data.date}T${data.time}:00.000Z`;

      await createSymptomRecord(token, {
        pet_id: data.petId,
        symptom: "General Symptom", // Default title as discussed
        date: fullDateISO,
        note: data.note,
        images: imageUrls,
        severity: "Mild" // Default
      });

      await fetchRecords();
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

      // Upload NEW images
      const newImageUrls: string[] = [];
      if (payload.newImages && payload.newImages.length > 0) {
        const uploadPromises = payload.newImages.map(file => uploadImage(file, token));
        const results = await Promise.all(uploadPromises);
        newImageUrls.push(...results);
      }

      const finalImages = [...payload.existingImages, ...newImageUrls];
      const fullDateISO = `${payload.date}T${payload.time}:00.000Z`;

      await editSymptomRecord(token, payload.id, {
        date: fullDateISO,
        note: payload.note,
        images: finalImages,
        // symptom: ... // reuse existing or update? API updates partial.
      });

      await fetchRecords();
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
      await fetchRecords();
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

        {recordsOnSelectedDate.length === 0 ? (
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
                  avatarUrl={pet?.profile_image}
                  imageUrls={record.images ?? []}
                  onClick={() => {
                    setDetailRecord({
                      ...record,
                      petName: pet?.name ?? "-",
                      petPid: pet?._id ?? "-",
                      avatarUrl: pet?.profile_image,
                      date: record.dateKey,
                      imageUrls: record.images ?? [],
                    });
                  }}
                />
              );
            })}
          </>
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