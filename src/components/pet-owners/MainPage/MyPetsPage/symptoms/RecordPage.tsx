"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { PetLite } from "@/types/domain/pet";

// Import Components
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector, {
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";
import RecordScreen, {
  type RecordItem,
} from "@/components/pet-owners/shared/records/RecordScreen";
import RecordDetailPopup, {
  type RecordDetailItem,
} from "@/components/pet-owners/shared/records/RecordDetailPopup";
import EditRecordPopup, {
  type EditSymptomPayload,
} from "@/components/pet-owners/shared/records/EditRecordPopup";
import AddRecordPopup, { AddSymptomPayload } from "@/components/pet-owners/shared/records/AddRecordPopup";

// Import UI Library & Icons
import { Add } from "@mui/icons-material";
import Button from "@/components/pet-owners/shared/Button";
import { usePets } from "@/hooks/usePets";
import { Pet } from "@/types/domain/pet";

// API
import {
  getSymptomRecordsCalendar,
  createSymptomRecord,
  editSymptomRecord,
  deleteSymptomRecord,
  authStorage
} from "@/services/api/client";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function extractTimeFromISO(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function RecordPage() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const { pets } = usePets();

  const petOptions: PetLite[] = useMemo(() => {
    return (pets ?? []).map((p: Pet) => ({
      _id: String(p._id),
      name: p.name ?? "-",
      profile_image: p.profile_image,
    }));
  }, [pets]);

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    const fallback = petOptions[0]?._id ?? "";
    return String(petId ?? fallback);
  });

  useEffect(() => {
    if (!petId) return;
    const idFromUrl = String(petId);
    const exists = petOptions.some((p) => String(p._id) === idFromUrl);
    if (exists) {
      setSelectedPetId(idFromUrl);
      return;
    }
    if (petOptions[0]?._id) setSelectedPetId(String(petOptions[0]._id));
  }, [petId, petOptions]);

  const selectedPet: PetLite | null = useMemo(() => {
    if (!petOptions.length) return null;
    return petOptions.find((p) => p._id === selectedPetId) ?? petOptions[0] ?? null;
  }, [petOptions, selectedPetId]);

  const [items, setItems] = useState<RecordItem[]>([]);
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO());
  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecordDetailItem | null>(null);
  const [editRecord, setEditRecord] = useState<RecordDetailItem | null>(null);

  // Fetch Logic
  const fetchRecords = useCallback(async () => {
    if (!selectedPetId) return;
    try {
      const token = authStorage.getToken();
      if (!token) return;

      // We fetch specifically for the selected pet
      const response = await getSymptomRecordsCalendar(token, selectedPetId);

      // Flatten the response
      const allRecords = Object.values(response).flat();

      // Map to RecordItem
      const mappedItems: RecordItem[] = allRecords.map(r => {
        // Mapping Pet Info - assuming r.pet_id is current selectedPetId or we look up from pets list if needed
        // For this page, we mostly filter by selectedPetId anyway.
        const p = petOptions.find(opt => opt._id === r.pet_id);

        const dateKey = r.date.includes('T') ? r.date.split('T')[0] : r.date;
        const time = r.date.includes('T') ? extractTimeFromISO(r.date) : "00:00";

        return {
          id: r._id,
          petId: r.pet_id,
          petName: p?.name ?? "-",
          petPid: p?._id ?? "-",
          avatarUrl: p?.profile_image,
          date: dateKey,
          time: time,
          note: r.note || "",
          imageUrls: r.images ?? []
        };
      });

      setItems(mappedItems);

    } catch (err) {
      console.error("Failed to fetch records", err);
    }
  }, [selectedPetId, petOptions]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);


  function openDetailById(id: string) {
    const found = items.find((x) => x.id === id);
    if (!found) return;
    setDetailRecord({ ...found, petPid: found.petPid ?? "-" });
  }

  async function handleSaveAdd(data: AddSymptomPayload) {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const fullDateISO = `${data.date}T${data.time}:00.000Z`;

      await createSymptomRecord(token, {
        pet_id: data.petId,
        symptom: "General Symptom",
        date: fullDateISO,
        note: data.note,
        images: data.images, // Now strings[]
        severity: "Mild"
      });

      await fetchRecords();
      setOpenCreate(false);
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create record");
    }
  }

  async function handleSaveEdit(payload: EditSymptomPayload) {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const finalImages = [...payload.existingImages, ...payload.newImages]; // payload.newImages is strings[]
      const fullDateISO = `${payload.date}T${payload.time}:00.000Z`;

      await editSymptomRecord(token, payload.id, {
        date: fullDateISO,
        note: payload.note,
        images: finalImages,
      });

      await fetchRecords();
      setEditRecord(null);
    } catch (err) {
      console.error("Edit failed", err);
      alert("Failed to update record");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
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

  const selectorSlot = useMemo(() => (
    <PetFilterSelector
      mode="filter"
      allowAllPets={false}
      pets={petOptions}
      value={selectedPetId as PetSelectorValue}
      onChange={(v) => setSelectedPetId(String(v))}
    />
  ), [petOptions, selectedPetId]);

  return (
    <>
      <TopBar
        title="Pets Record"
        onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?._id ?? ""}`)}
      />

      <RecordScreen
        headerSlot={null}
        selectorSlot={selectorSlot}
        fabSlot={
          <div className="fixed bottom-6 right-6 z-[100]">
            {/* ใช้วิธีเรียกใช้ Button Component ที่เพื่อนคุณทำมา */}
            <Button
              variant="primary"
              size="lg"
              shape="pill"
              icon="only"
              onClick={() => setOpenCreate(true)}
              style={{
                width: '56px',
                height: '56px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
              }}
              aria-label="Add record"
            >
              <Add style={{ fontSize: '32px' }} />
            </Button>
          </div>
        }
        items={items}
        selectedPetId={selectedPetId}
        selectedDateISO={selectedDateISO}
        onChangeSelectedDateISO={setSelectedDateISO}
        onClickItem={(id) => openDetailById(id)}
      />

      {/* Create */}
      {selectedPet && (
        <AddRecordPopup
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          pet={{
            id: selectedPet._id,
            name: selectedPet.name ?? "-",
            pid: selectedPet._id ?? "-",
            avatarUrl: selectedPet.profile_image,
          }}
          onSubmit={handleSaveAdd}
        />
      )}

      {/* Detail & Edit Popups */}
      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => { setDetailRecord(null); setEditRecord(rec); }}
        onDelete={handleDelete}
        formatTime={(t: string) => t} // Format logic should be handled here or consistent
      />

      <EditRecordPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleSaveEdit}
        maxImages={4}
      />
    </>
  );
}