"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import { PetLite } from "@/types/domain/pet";

// Components
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector from "@/components/pet-owners/shared/PetFilterSelector";
import RecordScreen, {
  type RecordItem,
} from "@/components/pet-owners/shared/records/RecordScreen";
import RecordDetailPopup from "@/components/pet-owners/shared/records/RecordDetailPopup";
import EditRecordPopup, {
  EditRecordFormState,
} from "@/components/pet-owners/shared/records/EditRecordPopup";
import AddRecordPopup from "@/components/pet-owners/shared/records/AddRecordPopup";
import { AddSymptomPayload } from "@/types/api/record.dto";

// UI
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
  authStorage,
} from "@/services/api/client";

function pad2(n: number) {
  return String(n).padStart(2, "0");
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

  const [selectedPetId, setSelectedPetId] = useState<string>("");

  useEffect(() => {
    if (!petOptions.length) return;

    const idFromUrl = pet_id ? String(pet_id) : "";
    const exists = petOptions.some(
      (p) => String(p.pet_id) === idFromUrl
    );

    setSelectedPetId(
      exists
        ? idFromUrl
        : String(petOptions[0].pet_id)
    );
  }, [pet_id, petOptions]);

  const selectedPet = useMemo(() => {
    if (!petOptions.length) return null;
    return (
      petOptions.find(
        (p) => String(p.pet_id) === selectedPetId
      ) ?? petOptions[0]
    );
  }, [petOptions, selectedPetId]);

  const [items, setItems] = useState<RecordItem[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [detailRecord, setDetailRecord] =
    useState<any | null>(null);
  const [editRecord, setEditRecord] =
    useState<any | null>(null);

  // ===============================
  // FETCH RECORDS
  // ===============================
  const fetchRecords = useCallback(async () => {
    if (!selectedPetId) return;

    try {
      const token = authStorage.getToken();
      if (!token) return;

      const response =
        await getSymptomRecordsCalendar(
          token,
          selectedPetId
        );

      let allRecords: any[] = [];

      if (
        response &&
        typeof response === "object" &&
        !Array.isArray(response)
      ) {
        allRecords = Object.entries(response).flatMap(
          ([dateKey, records]) =>
            Array.isArray(records)
              ? records.map((r: any) => ({
                  ...r,
                  __dateFromKey: dateKey,
                }))
              : []
        );
      }

      if (Array.isArray(response)) {
        allRecords = response;
      }

      const mappedItems: RecordItem[] =
        allRecords.map((r: any) => {
          const hasISO =
            typeof r.time_added === "string" &&
            r.time_added.includes("T");

          const dateKey =
            r.__dateFromKey ||
            r.date_added ||
            (hasISO
              ? r.time_added.split("T")[0]
              : "");

          const time = hasISO
            ? extractTimeFromISO(
                r.time_added
              )
            : r.time_added || "00:00";

          return {
            id: String(r.record_id),
            petId: String(r.pet_id),
            petName:
              r.pet_name ??
              selectedPet?.name ??
              "-",
            petPid: String(r.pet_id ?? "-"),
            avatarUrl:
              r.pet_image ??
              selectedPet?.profile_image ??
              undefined,
            date: dateKey,
            time,
            note: r.note || "",
            imageUrls:
              r.note_image ?? [],
          };
        });

      mappedItems.sort((a, b) => {
        const aDate = new Date(
          `${a.date}T${a.time}`
        );
        const bDate = new Date(
          `${b.date}T${b.time}`
        );
        return (
          bDate.getTime() -
          aDate.getTime()
        );
      });

      setItems(mappedItems);
    } catch (err) {
      console.error(
        "Failed to fetch records",
        err
      );
    }
  }, [selectedPetId, selectedPet]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ===============================
  // OPEN DETAIL
  // ===============================
  function openDetailById(id: string) {
    const found = items.find(
      (x) => x.id === id
    );
    if (!found) return;

    setDetailRecord({
      record_id: Number(found.id),
      pet_id: Number(found.petId),
      pet_name: found.petName,
      pet_image: found.avatarUrl,
      date_added: found.date,
      time_added: `${found.date}T${found.time}`,
      note: found.note,
      note_image: found.imageUrls ?? [],
    });
  }

  // ===============================
  // CREATE
  // ===============================
  async function handleSaveAdd(
    data: AddSymptomPayload
  ) {
    const token = authStorage.getToken();
    if (!token) return;

    await createSymptomRecord(token, {
      pet_id: data.pet_id,
      note: data.note,
      note_image: data.note_image,
      time_added: data.time_added, // 🔥 สำคัญ
    });

    await fetchRecords();
    setOpenCreate(false);
  }

  // ===============================
  // EDIT
  // ===============================
  async function handleSaveEdit(
    recordId: number,
    payload: EditRecordFormState
  ) {
    const token = authStorage.getToken();
    if (!token) return;

    const finalImages = [
      ...(payload.existingImages ?? []),
      ...(payload.newImages ?? []),
    ];

    await editSymptomRecord(
      token,
      recordId,
      {
        note: payload.note,
        note_image: finalImages,
      }
    );

    await fetchRecords();
    setEditRecord(null);
  }

  // ===============================
  // DELETE
  // ===============================
  async function handleDelete(id: string) {
    const token = authStorage.getToken();
    if (!token) return;

    await deleteSymptomRecord(
      token,
      Number(id)
    );

    await fetchRecords();
    setDetailRecord(null);
  }

  const selectorSlot = useMemo(
    () => (
      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={petOptions as any}
        value={Number(selectedPetId)}
        onChange={(v) =>
          setSelectedPetId(String(v))
        }
      />
    ),
    [petOptions, selectedPetId]
  );

  return (
    <>
      <TopBar
        title="Pets Record"
        onBack={() =>
          router.push(
            `/pet-owners/my-pets-page/${selectedPet?.pet_id ?? ""}`
          )
        }
      />

      <RecordScreen
        headerSlot={null}
        selectorSlot={selectorSlot}
        fabSlot={
          <div className="fixed bottom-6 right-6 z-[100]">
            <Button
              variant="primary"
              size="lg"
              shape="pill"
              icon="only"
              onClick={() =>
                setOpenCreate(true)
              }
              style={{
                width: "56px",
                height: "56px",
                boxShadow:
                  "0px 4px 10px rgba(0,0,0,0.3)",
              }}
            >
              <Add
                style={{
                  fontSize: "32px",
                }}
              />
            </Button>
          </div>
        }
        items={items}
        selectedPetId={selectedPetId}
        onClickItem={(id) =>
          openDetailById(id)
        }
      />

      {selectedPet && (
        <AddRecordPopup
          open={openCreate}
          onClose={() =>
            setOpenCreate(false)
          }
          pet={selectedPet}
          onSubmit={handleSaveAdd}
        />
      )}

      <RecordDetailPopup
        open={!!detailRecord}
        record={detailRecord}
        onClose={() =>
          setDetailRecord(null)
        }
        onEdit={(rec) => {
          setDetailRecord(null);
          setEditRecord(rec);
        }}
        onDelete={(id: number) =>
          handleDelete(String(id))
        }
      />

      <EditRecordPopup
        open={!!editRecord}
        record={editRecord}
        onClose={() =>
          setEditRecord(null)
        }
        onSave={(
          record_id: number,
          data: EditRecordFormState
        ) =>
          handleSaveEdit(
            record_id,
            data
          )
        }
        maxImages={4}
      />
    </>
  );
}