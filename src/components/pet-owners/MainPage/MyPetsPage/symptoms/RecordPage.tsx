"use client";

import { useEffect, useMemo, useState } from "react";
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
import AddRecordPopup from "@/components/pet-owners/shared/records/AddRecordPopup";

// Import UI Library & Icons
import { Add } from "@mui/icons-material";
import Button from "@/components/pet-owners/shared/Button"; // ตรวจสอบ Path ไฟล์ Button ที่คุณให้มาอีกครั้ง
import { mockPets } from "@/mocks/pets.mock";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function filesToObjectUrls(files: File[] | undefined) {
  return (files ?? []).map((f) => URL.createObjectURL(f));
}

export default function RecordPage() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const petOptions: PetLite[] = useMemo(() => {
    return (mockPets ?? []).map((p) => ({
      _id: String(p._id),
      name: p.name ?? "-",
      profile_image: p.profile_image,
    }));
  }, []);

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

  const [items, setItems] = useState<RecordItem[]>(() => {
    const a = mockPets?.[0];
    const b = mockPets?.[1];
    const base: RecordItem[] = [];

    if (a) {
      base.push({
        id: "rec-001",
        petId: String(a._id),
        petName: a.name ?? "-",
        petPid: String(a._id),
        avatarUrl: a.profile_image,
        date: "2025-12-17",
        time: "11:00",
        note: "มีอาการซึมไม่อยากอาหาร มีอาเจียนเล็กน้อย",
        imageUrls: ["/pets-example/pet-ex1.svg"],
      });
    }
    return base;
  });

  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO());
  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] = useState<RecordDetailItem | null>(null);
  const [editRecord, setEditRecord] = useState<RecordDetailItem | null>(null);

  function openDetailById(id: string) {
    const found = items.find((x) => x.id === id);
    if (!found) return;
    setDetailRecord({ ...found, petPid: found.petPid ?? "-" });
  }

  function handleSaveEdit(payload: EditSymptomPayload) {
    setItems((prev) =>
      prev.map((x) => (x.id === payload.id ? { ...x, ...payload } : x))
    );
    setEditRecord(null);
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
          onSubmit={(data: any) => {
            const newItem: RecordItem = {
              id: `rec-${String(Date.now())}`,
              petId: selectedPet._id,
              petName: selectedPet.name ?? "-",
              petPid: selectedPet._id ?? "-",
              avatarUrl: selectedPet.profile_image,
              date: String(data.date ?? todayISO()),
              time: String(data.time ?? "00:00"),
              note: String(data.note ?? ""),
              imageUrls: filesToObjectUrls(data.images),
            };
            setItems((prev) => [newItem, ...prev]);
            setOpenCreate(false);
          }}
        />
      )}

      {/* Detail & Edit Popups */}
      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => { setDetailRecord(null); setEditRecord(rec); }}
        onDelete={(id) => { setItems(prev => prev.filter(x => x.id !== id)); setDetailRecord(null); }}
        formatTime={(t: string) => t}
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