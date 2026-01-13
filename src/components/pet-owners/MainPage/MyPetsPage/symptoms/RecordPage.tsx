"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector, {
  type PetLite,
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
import { Add } from '@mui/icons-material';
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
      id: String(p._id),  
      name: p.name ?? "-",
      pid: String(p._id),        
      avatarUrl: p.profile_image,  
    }));
  }, []);

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    const fallback = petOptions[0]?.id ?? "";
    return String(petId ?? fallback);
  });

  useEffect(() => {
    if (!petId) return;

    const idFromUrl = String(petId);
    const exists = petOptions.some((p) => String(p.id) === idFromUrl);
    if (exists) {
      setSelectedPetId(idFromUrl);
      return;
    }

    if (petOptions[0]?.id) setSelectedPetId(String(petOptions[0].id));
  }, [petId, petOptions]);

  const selectedPet: PetLite | null = useMemo(() => {
    if (!petOptions.length) return null;
    return petOptions.find((p) => p.id === selectedPetId) ?? petOptions[0] ?? null;
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
        imageUrls: [
          "/pets-example/pet-ex1.svg",
          "/pets-example/pet-ex1.svg",
          "/pets-example/pet-ex1.svg",
        ],
      });
    }

    if (b) {
      base.push({
        id: "rec-002",
        petId: String(b._id),      
        petName: b.name ?? "-",
        petPid: String(b._id),   
        avatarUrl: b.profile_image,   
        date: "2025-12-17",
        time: "09:30",
        note: "เกาไม่หยุดบริเวณคอ อาจแพ้/ระคายเคือง",
        imageUrls: [
          "/pets-example/pet-ex2.svg",
          "/pets-example/pet-ex2.svg",
          "/pets-example/pet-ex2.svg",
          "/pets-example/pet-ex2.svg",
        ],
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

    const detail: RecordDetailItem = {
      id: found.id,
      petId: found.petId,
      petName: found.petName,
      petPid: found.petPid ?? "-",
      avatarUrl: found.avatarUrl,
      date: found.date,
      time: found.time,
      note: found.note,
      imageUrls: found.imageUrls ?? [],
    };

    setDetailRecord(detail);
  }

  function handleDeleteFromDetail(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
    setDetailRecord(null);
  }

  function handleEditFromDetail(rec: RecordDetailItem) {
    setDetailRecord(null);
    setEditRecord(rec);
  }

  function handleSaveEdit(payload: EditSymptomPayload) {
    setItems((prev) =>
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

  const selectorSlot = useMemo(() => {
    const pets: PetLite[] = petOptions.map((p) => ({
      id: p.id,
      name: p.name,
      pid: p.pid,
      avatarUrl: p.avatarUrl,
    }));

    return (
      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={pets}
        value={selectedPetId as PetSelectorValue}
        onChange={(v) => setSelectedPetId(String(v))}
      />
    );
  }, [petOptions, selectedPetId]);

  return (
    <>
      <TopBar
        title="Pets Record"
        onBack={() =>
          router.push(`/pet-owners/my-pets-page/${selectedPet?.id ?? ""}`)
        }
      />

      <RecordScreen
        headerSlot={null}
        selectorSlot={selectorSlot}
        fabSlot={
          <div className="fixed bottom-6 right-6">
            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="h-14 w-14 rounded-full bg-sky-500 text-white shadow-lg text-2xl leading-none flex items-center justify-center active:scale-[0.98]"
              aria-label="Add record"
            >
              +
            </button>
          </div>
        }
        items={items}
        selectedPetId={selectedPetId}
        selectedDateISO={selectedDateISO}
        onChangeSelectedDateISO={setSelectedDateISO}
        onClickItem={(id) => openDetailById(id)}
      />

      {/* Create */}
      {selectedPet ? (
        <AddRecordPopup
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          pet={{
            id: selectedPet.id,
            name: selectedPet.name ?? "-",
            pid: selectedPet.pid ?? "-",
            avatarUrl: selectedPet.avatarUrl,
          }}
          onSubmit={(data: any) => {
            const petIdFromForm = String(data.petId ?? selectedPet.id);
            const meta = petOptions.find((p) => String(p.id) === petIdFromForm) ?? selectedPet;

            const newItem: RecordItem = {
              id: `rec-${String(Date.now())}`,
              petId: petIdFromForm,
              petName: meta.name ?? "-",
              petPid: meta.pid ?? "-",
              avatarUrl: meta.avatarUrl,
              date: String(data.date ?? todayISO()),
              time: String(data.time ?? "00:00"),
              note: String(data.note ?? ""),
              imageUrls: filesToObjectUrls(data.images),
            };

            setItems((prev) => [newItem, ...prev]);
            setOpenCreate(false);
          }}
        />
      ) : null}

      {/* Detail */}
      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() => setDetailRecord(null)}
        onEdit={(rec) => rec && handleEditFromDetail(rec)}
        onDelete={(id) => handleDeleteFromDetail(id)}
        formatTime={(t: string) => t}
      />

      {/* Edit */}
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