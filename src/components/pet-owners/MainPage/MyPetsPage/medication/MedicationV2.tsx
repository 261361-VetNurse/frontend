"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector, { PetSelectorValue, PetLite as SharedPetLite } from '@/components/pet-owners/shared/PetFilterSelector';
import CreateMedicationPopup from '../../MedicationPage/AddMedicationPopup';
import MedicationDetailPopup from '../../MedicationPage/MedicationDetailPopup';
import EditMedicationPopup from '../../MedicationPage/EditMedicationPopup';
import MedicineCard from '../../MedicationPage/MedicineCard';

import { MedicineReminderVM } from '@/types/medicine-reminder';
import { OccurrenceStatus } from '@/types/medication-occurrence';
import {
  formatTimeForDisplay,
  updateReminderTakenStatus,
  ReminderOccurrence,
  buildOccurrencesForDate,
  buildOccurrenceId,
  getTodayInLocalTimezone,
  getUserTimezone,
} from '@/lib/reminder-utils';
import { authStorage, getMedications, markMedicationTaken, deleteMedicine } from '@/lib/api-client';
import { usePets } from '@/lib/hooks/usePets';
import { theme } from '@/styles/theme';
import { FabButton } from "@/styles/appointments.styled";
import { Add } from "@mui/icons-material";
import { TabsWrap, TabButton, Header, CardList } from "../../../../../styles/medication.styled";

// Types
type TabType = 'today' | 'tomorrow' | 'other';
type OccurrenceOverride = { status: OccurrenceStatus; taken_at?: string | null };

function ymdInUserTz(date: Date): string {
  const userTz = getUserTimezone();
  const d = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return d;
}

function getDateForTab(tab: TabType): Date {
  const today = getTodayInLocalTimezone();
  if (tab === 'today') return today;

  if (tab === 'tomorrow') {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }

  // other: day+2
  const d = new Date(today);
  d.setDate(d.getDate() + 2);
  return d;
}

export default function MedicationPageV2() {
  const router = useRouter();
  const { petId } = useParams<{ petId: string }>();

  const [medicineReminders, setMedicineReminders] = useState<MedicineReminderVM[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets - Use API hook
  const { pets: apiPets, loading: petsLoading } = usePets();

  // Selected Pet Logic
  const [selectedPetId, setSelectedPetId] = useState<string>(petId ? String(petId) : '');

  // Sync state with URL param
  useEffect(() => {
    if (petId) {
      setSelectedPetId(String(petId));
    } else if (apiPets.length > 0 && !selectedPetId) {
      // If no petId in URL but we have pets, default to first or stay empty?
      // MyPetsPage usually requires a pet context, but let's handle if URL changes.
      // Actually, normally MyPetsPage requires selection.
    }
  }, [petId, apiPets, selectedPetId]);


  const petOptions: SharedPetLite[] = useMemo(() => {
    return apiPets.map(p => ({
      id: p._id,
      name: p.name,
      pid: p._id, // fallback
      avatarUrl: p.profile_image
    }));
  }, [apiPets]);

  const selectedPet = useMemo(() => {
    // If selectedPetId matches a pet, use it
    return petOptions.find(p => p.id === selectedPetId);
  }, [petOptions, selectedPetId]);

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const [selectedReminder, setSelectedReminder] = useState<{
    medicineReminder: MedicineReminderVM;
    highlightedReminderId?: string;
  } | null>(null);

  const [editingReminder, setEditingReminder] = useState<MedicineReminderVM | null>(null);
  const [occurrenceOverrides, setOccurrenceOverrides] = useState<Record<string, OccurrenceOverride>>({});

  const fetchReminders = useCallback(async () => {
    if (!selectedPetId) return;

    try {
      const token = authStorage.getToken();
      if (!token) return;
      setRemindersLoading(true);
      setError(null);

      try {
        const dateParam = undefined; // As per debug fix
        const petIdParam = selectedPetId;

        // Important: getMedications likely returns ALL meds for the pet, we filter by date client side
        const data = await getMedications(token, petIdParam, dateParam);
        setMedicineReminders(data);
      } catch (apiErr: any) {
        console.warn('API failed, using mock data:', apiErr?.message);
        const { mockMedicineReminderVMs } = await import('@/mocks/medicine-reminders.mock');
        setMedicineReminders(mockMedicineReminderVMs);
        setError('Using mock data (API unavailable)');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load medication reminders');
    } finally {
      setRemindersLoading(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);


  // Derived Data
  const baseDate = getDateForTab(activeTab);

  const occurrences: ReminderOccurrence[] = useMemo(() => {
    const today = getTodayInLocalTimezone();

    if (activeTab === 'today') {
      return buildOccurrencesForDate(medicineReminders, today, occurrenceOverrides);
    }

    if (activeTab === 'tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return buildOccurrencesForDate(medicineReminders, d, occurrenceOverrides);
    }

    // other: day+2..day+7
    const out: ReminderOccurrence[] = [];
    for (let i = 2; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      out.push(...buildOccurrencesForDate(medicineReminders, d, occurrenceOverrides));
    }

    return out.sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  }, [activeTab, medicineReminders, occurrenceOverrides]);

  const filteredOccurrences = useMemo(() => {
    // Already filtered by API for selectedPetId, but double check
    return occurrences.filter(o => o.pet._id === selectedPetId);
  }, [occurrences, selectedPetId]);


  // Handlers
  const handlePetSelect = (id: PetSelectorValue) => {
    const nextId = String(id);
    setSelectedPetId(nextId);
    router.push(`/pet-owners/my-pets-page/${nextId}/medications`);
  };

  const handleAdd = () => setShowCreatePopup(true);
  const handleCloseCreatePopup = () => setShowCreatePopup(false);

  const handleSubmitCreatePopup = () => {
    setShowCreatePopup(false);
    fetchReminders();
  };

  const handleReminderClick = (occ: ReminderOccurrence) => {
    const plan = medicineReminders.find(mr => mr.notification_id === occ.plan_id);
    if (!plan) return;
    setSelectedReminder({
      medicineReminder: plan,
      highlightedReminderId: occ.reminder_id,
    });
  };

  const handleEditFromCard = (occ: ReminderOccurrence) => {
    const plan = medicineReminders.find(mr => mr.notification_id === occ.plan_id);
    if (!plan) return;
    setEditingReminder(plan);
    setSelectedReminder(null);
  };

  const handleDeleteFromCard = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const token = authStorage.getToken();
        if (token) {
          const reminder = medicineReminders.find(mr => mr.notification_id === planId);
          if (reminder) {
            await deleteMedicine(token, planId, reminder.medicine._id);
            setMedicineReminders(prev => prev.filter(mr => mr.notification_id !== planId));
          }
        }
      } catch (err) {
        alert("Failed to delete medication");
      }
    }
  };

  const handleToggleReminder = async (planId: string, reminderId: string, isTaken: boolean) => {
    const updated = updateReminderTakenStatus(medicineReminders, planId, reminderId, isTaken);
    setMedicineReminders(updated);
    if (selectedReminder?.medicineReminder.notification_id === planId) {
      const updatedPlan = updated.find(mr => mr.notification_id === planId);
      if (updatedPlan) {
        setSelectedReminder(prev => prev ? { ...prev, medicineReminder: updatedPlan } : prev);
      }
    }
    try {
      const token = authStorage.getToken();
      if (token) await markMedicationTaken(token, reminderId, isTaken);
    } catch (err) {
      console.error(err);
      fetchReminders();
    }
  };

  const handleEditFromDetail = () => {
    if (!selectedReminder) return;
    setEditingReminder(selectedReminder.medicineReminder);
    setSelectedReminder(null);
  };

  const handleSaveEdit = () => {
    setEditingReminder(null);
    fetchReminders();
  };

  const formatDate = (d: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const loading = remindersLoading || petsLoading;

  // Need to map apiPets to ComponentPet for popups
  const popupPets = useMemo(() => {
    return apiPets.map(p => ({
      id: p._id,
      name: p.name,
      avatarUrl: p.profile_image
    }));
  }, [apiPets]);


  return (
    <div className="flex flex-col gap-4">
      <TopBar
        title="Medication"
        onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.id}`)}
      />

      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={petOptions}
        value={selectedPetId as PetSelectorValue}
        onChange={handlePetSelect}
      />

      <div style={{ marginTop: 8 }}>
        <TabsWrap>
          <TabButton $active={activeTab === "today"} onClick={() => setActiveTab("today")}>
            Today
          </TabButton>
          <TabButton $active={activeTab === "tomorrow"} onClick={() => setActiveTab("tomorrow")}>
            Tomorrow
          </TabButton>
          <TabButton $active={activeTab === "other"} onClick={() => setActiveTab("other")}>
            Other
          </TabButton>
        </TabsWrap>
      </div>

      <div style={{ marginTop: 8 }}>
        <Header>
          <div className="Title">
            {activeTab === 'today'
              ? "Today's Medication Reminders"
              : activeTab === 'tomorrow'
                ? "Tomorrow's Medication Reminders"
                : 'Other Medication Reminders'}
          </div>
          <div className="DateText">{activeTab !== 'other' ? formatDate(baseDate) : ''}</div>
        </Header>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : filteredOccurrences.length > 0 ? (
          <CardList>
            {(() => {
              // Group occurrences by plan_id similar to MedicationPage
              const groupedMap = new Map<string, {
                planId: string;
                pet: typeof filteredOccurrences[0]['pet'];
                medicine: typeof filteredOccurrences[0]['medicine'];
                isStopped: boolean;
                slots: { id: string; timeLabel: string; status: any }[];
              }>();

              filteredOccurrences.forEach(occ => {
                const plan = medicineReminders.find(p => p.notification_id === occ.plan_id);
                const isStopped = plan?.medication_status?.is_stopped ?? false;

                if (!groupedMap.has(occ.plan_id)) {
                  groupedMap.set(occ.plan_id, {
                    planId: occ.plan_id,
                    pet: occ.pet,
                    medicine: occ.medicine,
                    isStopped,
                    slots: []
                  });
                }

                const group = groupedMap.get(occ.plan_id)!;
                group.slots.push({
                  id: occ.reminder_id,
                  timeLabel: formatTimeForDisplay(occ.time),
                  status: occ.status
                });
              });

              const groupedList = Array.from(groupedMap.values()).sort((a, b) => {
                const validSlotsA = a.slots[0];
                const validSlotsB = b.slots[0];
                if (!validSlotsA || !validSlotsB) return 0;
                return validSlotsA.timeLabel.localeCompare(validSlotsB.timeLabel);
              });

              return groupedList.map(group => (
                <MedicineCard
                  key={group.planId}
                  petName={group.pet.name}
                  petImageUrl={group.pet.profile_image}
                  medicineName={group.medicine.name}
                  dosage={group.medicine.dosage}
                  times={group.slots}
                  isStopped={group.isStopped}
                  onOpenDetail={() => {
                    // Find generic occurrence to trigger click
                    const firstOcc = filteredOccurrences.find(o => o.plan_id === group.planId);
                    if (firstOcc) handleReminderClick(firstOcc);
                  }}
                  onToggleTaken={(reminderId, next) =>
                    handleToggleReminder(group.planId, reminderId, next)
                  }
                  onEdit={() => {
                    const firstOcc = filteredOccurrences.find(o => o.plan_id === group.planId);
                    if (firstOcc) handleEditFromCard(firstOcc);
                  }}
                  onDelete={() => handleDeleteFromCard(group.planId)}

                />
              ));
            })()}
          </CardList>
        ) : (
          <div style={{ fontSize: 14, color: "#71717a", textAlign: 'center', padding: '32px' }}>
            No medication reminders.
          </div>
        )}
      </div>

      <FabButton onClick={handleAdd}>
        <Add />
      </FabButton>

      <CreateMedicationPopup
        open={showCreatePopup}
        onClose={handleCloseCreatePopup}
        onSuccess={handleSubmitCreatePopup}
        pets={popupPets}
        initialPetId={selectedPetId}
      />

      {selectedReminder && (
        <MedicationDetailPopup
          page="medication-page"
          medicineReminder={selectedReminder.medicineReminder}
          highlightedReminderId={selectedReminder.highlightedReminderId}
          onClose={() => setSelectedReminder(null)}
          onToggleReminder={(reminderId: string, isTaken: boolean) =>
            handleToggleReminder(selectedReminder.medicineReminder.notification_id, reminderId, isTaken)
          }
          onEdit={handleEditFromDetail}
        />
      )}

      {editingReminder && (
        <EditMedicationPopup
          open={!!editingReminder}
          onClose={() => setEditingReminder(null)}
          medicineReminder={editingReminder}
          pets={popupPets}
          onSuccess={handleSaveEdit}
        />
      )}
    </div>
  );
}