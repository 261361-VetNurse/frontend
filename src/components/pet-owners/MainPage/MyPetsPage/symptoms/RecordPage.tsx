"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { PetLite } from "@/types/domain/pet";

// Import Components
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector from "@/components/pet-owners/shared/PetFilterSelector";
import RecordScreen, {
  type RecordItem,
} from "@/components/pet-owners/shared/records/RecordScreen";
import RecordDetailPopup from "@/components/pet-owners/shared/records/RecordDetailPopup";
import EditRecordPopup, { EditRecordFormState } from "@/components/pet-owners/shared/records/EditRecordPopup";
import AddRecordPopup from "@/components/pet-owners/shared/records/AddRecordPopup";
import { AddSymptomPayload } from "@/types/api/record.dto";

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
  const { pet_id } = useParams<{ pet_id: string }>();

  const { pets } = usePets();

  const petOptions: PetLite[] = useMemo(() => {
    return (pets ?? []).map((p: Pet) => ({
      pet_id: p.pet_id,
      name: p.name ?? "-",
      profile_image: p.profile_image,
    }));
  }, [pets]);

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    const fallback = petOptions[0]?.pet_id ? String(petOptions[0].pet_id) : "";
    return String(pet_id ?? fallback);
  });

  useEffect(() => {
    if (!pet_id) return;
    const idFromUrl = String(pet_id);
    const exists = petOptions.some((p) => String(p.pet_id) === idFromUrl);
    if (exists) {
      setSelectedPetId(idFromUrl);
      return;
    }
    if (petOptions[0]?.pet_id) setSelectedPetId(String(petOptions[0].pet_id));
  }, [pet_id, petOptions]);

  const selectedPet: PetLite | null = useMemo(() => {
    if (!petOptions.length) return null;
    return petOptions.find((p) => String(p.pet_id) === selectedPetId) ?? petOptions[0] ?? null;
  }, [petOptions, selectedPetId]);

  const [items, setItems] = useState<RecordItem[]>([]);
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO());
  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);

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
        const p = petOptions.find(opt => String(opt.pet_id) === String(r.pet_id));

        // SymptomRecord has time_added which might be ISO or HH:MM. 
        // We'll treat it as ISO for detail mapping.
        const dateKey = r.date_added || (r.time_added.includes('T') ? r.time_added.split('T')[0] : todayISO());
        const time = r.time_added.includes('T') ? extractTimeFromISO(r.time_added) : r.time_added;

        return {
          id: String(r.record_id),
          petId: String(r.pet_id),
          petName: p?.name ?? (r.pet_name || "-"),
          petPid: p?.pet_id ? String(p.pet_id) : (r.pet_id ? String(r.pet_id) : "-"),
          avatarUrl: p?.profile_image || r.pet_image || undefined,
          date: dateKey,
          time: time,
          note: r.note || "",
          imageUrls: r.note_image ?? []
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

      await createSymptomRecord(token, {
        pet_id: data.pet_id,
        note: data.note,
        note_image: data.note_image,
        date_added: data.date_added,
        time_added: data.time_added,
      });

      await fetchRecords();
      setOpenCreate(false);
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create record");
    }
  }

  async function handleSaveEdit(recordId: number, payload: EditRecordFormState) {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const finalImages = [...(payload.existingImages ?? []), ...(payload.newImages ?? [])];

      await editSymptomRecord(token, recordId, {
        note: payload.note,
        note_image: finalImages,
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

      await deleteSymptomRecord(token, Number(id));
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
      pets={petOptions as any}
      value={Number(selectedPetId)}
      onChange={(v) => setSelectedPetId(String(v))}
    />
  ), [petOptions, selectedPetId]);

  return (
    <>
      <TopBar
        title="Pets Record"
        onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.pet_id ?? ""}`)}
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
          allPets={petOptions}
          initialPetId={Number(selectedPetId)}
          onSubmit={handleSaveAdd}
        />
      )}

      {/* Detail & Edit Popups */}
      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => { setDetailRecord(null); setEditRecord(rec); }}
        onDelete={(id: number) => {
          handleDelete(String(id));
        }}
        formatTime={(t: string) => t} // Format logic should be handled here or consistent
      />

      <EditRecordPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() => setEditRecord(null)}
        onSave={(record_id: number, data: EditRecordFormState) => handleSaveEdit(record_id, data)}
        maxImages={4}
      />
    </>
  );
}