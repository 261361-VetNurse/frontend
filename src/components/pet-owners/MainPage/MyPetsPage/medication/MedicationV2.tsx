"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector, {
  PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CreateMedicationPopup from "../../MedicationPage/AddMedicationPopup";
import MedicationDetailPopup from "../../MedicationPage/MedicationDetailPopup";
import EditMedicationPopup from "../../MedicationPage/EditMedicationPopup";
import MedicineCard from "../../MedicationPage/MedicineCard";

import { MedicineReminderVM } from "@/types/medicine-reminder";
import { OccurrenceStatus } from "@/types/medication-occurrence";
import { formatTimeForDisplay } from "@/lib/reminder-utils";

import { usePets } from "@/lib/hooks/usePets";
import { FabButton } from "@/styles/appointments.styled";
import { Add } from "@mui/icons-material";
import { CardList } from "../../../../../styles/medication.styled";

import { mockMedicineReminderVMs } from "@/mocks/medicine-reminders.mock";

const USE_MEDICATION_MOCK = true;

type MedicationFilter = "active" | "stopped" | "all";

export default function MedicationPageV2() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  /* ---------------- pets ---------------- */
  const { pets: apiPets, loading: petsLoading } = usePets();

  const [selectedPetId, setSelectedPetId] = useState<string>(
    petId ? String(petId) : ""
  );

  useEffect(() => {
    if (petId) setSelectedPetId(String(petId));
  }, [petId]);

  const selectedPet = useMemo(
    () => apiPets.find((p) => String(p._id) === String(selectedPetId)),
    [apiPets, selectedPetId]
  );

  /* ---------------- medication data ---------------- */
  const [medicineReminders, setMedicineReminders] =
    useState<MedicineReminderVM[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- UI state ---------------- */
  const [filter, setFilter] = useState<MedicationFilter>("active");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [editingReminder, setEditingReminder] =
    useState<MedicineReminderVM | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<{
    medicineReminder: MedicineReminderVM;
    highlightedReminderId?: string;
  } | null>(null);

  /* ---------------- fetch (mock) ---------------- */
  const fetchReminders = useCallback(async () => {
    if (!selectedPetId) return;

    setLoading(true);
    try {
      if (USE_MEDICATION_MOCK) {
        const filtered = mockMedicineReminderVMs.filter(
          (m) => String(m.pet._id) === String(selectedPetId)
        );
        setMedicineReminders(filtered);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  /* ---------------- filter logic ---------------- */
  const filteredMedications = useMemo(() => {
    if (filter === "all") return medicineReminders;
    if (filter === "active") {
      return medicineReminders.filter(
        (m) => !m.medication_status?.is_stopped
      );
    }
    return medicineReminders.filter(
      (m) => m.medication_status?.is_stopped
    );
  }, [medicineReminders, filter]);

  /* ---------------- helpers ---------------- */
  const mapTimes = (m: MedicineReminderVM) =>
    m.schedule.reminders.map((r) => ({
      id: r.id,
      timeLabel: formatTimeForDisplay(r.time),
      status: r.status as OccurrenceStatus,
    }));

  const handlePetSelect = (id: PetSelectorValue) => {
    const nextId = String(id);
    setSelectedPetId(nextId);
    router.push(`/pet-owners/my-pets-page/${nextId}/medications`);
  };

  /* ---------------- render ---------------- */
  return (
    <div className="flex flex-col gap-4">
      <TopBar
        title="Medication"
        onBack={() =>
          router.push(`/pet-owners/my-pets-page/${selectedPet?._id}`)
        }
      />

      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={apiPets}
        value={selectedPetId as PetSelectorValue}
        onChange={handlePetSelect}
      />

      {/* ===== Segmented Status Filter ===== */}
      <div className="mx-2">
        <div className="flex bg-zinc-100 rounded-full p-1">
          {[
            { key: "active", label: "Active" },
            { key: "stopped", label: "Stopped" },
            { key: "all", label: "All" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key as MedicationFilter)}
              className={[
                "flex-1 py-2 rounded-full text-sm font-medium transition",
                filter === t.key
                  ? "bg-sky-500 text-white shadow"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Medication List ===== */}
      {loading || petsLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredMedications.length > 0 ? (
        <CardList>
          {filteredMedications.map((m) => (
            <MedicineCard
              key={m.notification_id}
              petName={m.pet.name}
              petImageUrl={m.pet.profile_image}
              medicineName={m.medicine.name}
              dosage={m.medicine.dosage}
              times={mapTimes(m)}
              isStopped={!!m.medication_status?.is_stopped}
              onOpenDetail={() =>
                setSelectedReminder({ medicineReminder: m })
              }
              onToggleTaken={() => {}}
              onEdit={() => setEditingReminder(m)}
              onDelete={() => {}}
            />
          ))}
        </CardList>
      ) : (
        <p className="text-sm text-zinc-400 text-center py-8">
          No medications found.
        </p>
      )}

      <FabButton onClick={() => setShowCreatePopup(true)}>
        <Add />
      </FabButton>

      {showCreatePopup && (
        <CreateMedicationPopup
          open={showCreatePopup}
          onClose={() => setShowCreatePopup(false)}
          onSuccess={fetchReminders}
          pets={apiPets}
          initialPetId={selectedPetId}
        />
      )}

      {editingReminder && (
        <EditMedicationPopup
          open={!!editingReminder}
          onClose={() => setEditingReminder(null)}
          medicineReminder={editingReminder}
          pets={apiPets}
          onSuccess={fetchReminders}
        />
      )}

      {selectedReminder && (
        <MedicationDetailPopup
          page="medication-page"
          medicineReminder={selectedReminder.medicineReminder}
          highlightedReminderId={selectedReminder.highlightedReminderId}
          onClose={() => setSelectedReminder(null)}
          onToggleReminder={() => {}}
          onEdit={() => {}}
        />
      )}
    </div>
  );
}
