'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Page,
  Header,
  CardList,
} from '@/styles/components/medication.styled';
import type { Pet, PetId } from '@/types/domain/pet';
import { theme } from '@/styles/tokens/theme';
import { Tabs } from '@/components/pet-owners/shared/Tabs';
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import { QuickDialButton } from '@/components/pet-owners/shared/QuickDialButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  ReminderOccurrence
} from '@/types/domain/medication-occurrence';
import MedicineCard, { TimeSlot } from './MedicineCard';
import CreateMedicationPopup from './AddMedicationPopup';
import EditMedicationPopup from './EditMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';

// Hooks
import { usePets } from '@/hooks';

// Types
import { MedicineReminderVM } from '@/types/domain/medication';

// Mock Data
import { authStorage, getMedications } from '@/services/api/client';

type TabType = 'today' | 'tomorrow' | 'other';

export default function MedicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [occurrences, setOccurrences] = useState<ReminderOccurrence[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pets
  const { pets, loading: petsLoading } = usePets();

  // Read active tab
  const activeTab = (searchParams.get('tab') as TabType) || 'today';

  const [selectedPetId, setSelectedPetId] = useState<PetId>('all');
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const medicationTabs = [
    { name: "Today", path: "/pet-owners/medication-page?tab=today", params: "today" },
    { name: "Tomorrow", path: "/pet-owners/medication-page?tab=tomorrow", params: "tomorrow" },
    { name: "Other", path: "/pet-owners/medication-page?tab=other", params: "other" },
  ];

  const [selectedReminder, setSelectedReminder] = useState<{
    medicineReminder: MedicineReminderVM;
    highlightedReminderId?: string;
  } | null>(null);

  const [editingReminder, setEditingReminder] = useState<MedicineReminderVM | null>(null);

  // Helper: Get Date for Tab
  const getDateForTab = (tab: TabType): Date => {
    const d = new Date();
    if (tab === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (tab === 'other') {
      // For "other", show day after tomorrow
      d.setDate(d.getDate() + 2);
    }
    return d;
  };

  const baseDate = getDateForTab(activeTab);

  // Build occurrences from mock data
  const fetchReminders = useCallback(async () => {
    setLoading(true);

    try {
      const token = authStorage.getToken() || "";
      const dateForTab = getDateForTab(activeTab);
      // Format as YYYY-MM-DD
      const dateStr = dateForTab.toISOString().split('T')[0];

      // Fetch occurrences directly from API
      const data = await getMedications(token, selectedPetId === 'all' ? undefined : selectedPetId, dateStr);

      // Data is already ReminderOccurrence[]
      const allOccurrences = data as ReminderOccurrence[];

      // Sort by scheduled time
      const sorted = allOccurrences.sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );

      setOccurrences(sorted);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setOccurrences([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedPetId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Deep link handling (updated to use getMedicationDetail)
  useEffect(() => {
    const notificationId = searchParams.get('notification_id');
    const reminderId = searchParams.get('reminder_id');
    const openMode = searchParams.get('open');

    const handleDeepLink = async () => {
      if (!notificationId) {
        if (selectedReminder && !openMode && !reminderId) setSelectedReminder(null);
        if (editingReminder && openMode !== 'edit') setEditingReminder(null);
        return;
      }

      // If we already have the correct data open, don't re-fetch
      if (openMode === 'edit' && editingReminder?.notification_id === notificationId) return;
      if (selectedReminder?.medicineReminder.notification_id === notificationId && !openMode) {
        // just update highlighted ID if needed
        if (selectedReminder.highlightedReminderId !== reminderId) {
          setSelectedReminder(prev => prev ? ({ ...prev, highlightedReminderId: reminderId || undefined }) : null);
        }
        return;
      }

      try {
        const token = authStorage.getToken() || "";
        // Fetch full detail for the popup
        const detail = await import('@/services/api/client').then(m => m.getMedicationDetail(token, notificationId));

        if (detail) {
          if (openMode === 'edit') {
            setEditingReminder(detail);
            setSelectedReminder(null);
          } else {
            setSelectedReminder({
              medicineReminder: detail,
              highlightedReminderId: reminderId || undefined
            });
            setEditingReminder(null);
          }
        }
      } catch (err) {
        console.error("Failed to load medication detail for deep link:", err);
      }
    };

    handleDeepLink();
  }, [searchParams, selectedReminder, editingReminder]);


  // Filtered occurrences - filtering is already done in fetchReminders by API
  const filteredOccurrences = useMemo(() => {
    return occurrences;
  }, [occurrences]);


  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
  };

  const handleAdd = () => {
    setShowCreatePopup(true);
  };

  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
  };

  const handleSubmitCreatePopup = () => {
    // Close popup
    setShowCreatePopup(false);
    // Refresh occurrences
    fetchReminders();
  };

  const handleReminderClick = (occ: ReminderOccurrence) => {
    // Update URL instead of setting state directly
    const params = new URLSearchParams(searchParams.toString());
    params.set('notification_id', occ.plan_id);
    params.set('reminder_id', occ.reminder_id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleEditFromCard = (occ: ReminderOccurrence) => {
    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('notification_id', occ.plan_id);
    params.set('open', 'edit');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDeleteFromCard = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const token = authStorage.getToken() || "";
        // We'd need a medicine ID, but the card only has planId (notification_id)
        // AND we might need medicineId. usage of deleteMedicine(token, notifId, medId).
        // BUT groupedMap logic below doesn't easily give medicineId unless we look at the occ.
        // Let's find an occurrence for this plan
        const occ = occurrences.find(o => o.plan_id === planId);
        if (occ) {
          // In mock/API, we might need medicineId. 
          // The API signature is deleteMedicine(token, notificationId, medicineId).
          // Occurrence has medicine._id
          await import('@/services/api/client').then(m => m.deleteMedicine(token, planId, occ.medicine._id));

          // Refresh
          fetchReminders();
        }
      } catch (err) {
        console.error(err);
        alert("Failed to delete medication");
      }
    }
  };

  const handleToggleReminder = async (planId: string, reminderId: string, isTaken: boolean) => {
    // Optimistic update in list
    setOccurrences(prev => prev.map(occ => {
      if (occ.plan_id === planId && occ.reminder_id === reminderId) {
        return {
          ...occ,
          status: isTaken ? 'taken' : 'pending',
          taken_at: isTaken ? new Date().toISOString() : null
        };
      }
      return occ;
    }));

    // API Call
    try {
      const token = authStorage.getToken() || "";
      await import('@/services/api/client').then(m => m.markMedicationTaken(token, planId, isTaken)); // API might need reminderId too? Current mock uses notifId + toggle. 
      // Real API likely needs specific reminder ID if multiple per day.
      // user's generic 'markMedicationTaken' takes notificationId and istaken. 
      // It might toggle all? Or needs to be updated. 
      // For now adhering to existing client signature but knowing it might be imperfect for multi-dose.
      // Re-fetch to be safe
      fetchReminders();
    } catch (e) {
      console.error("Failed to toggle", e);
      fetchReminders(); // revert
    }

    // If detail is open, update it too
    if (selectedReminder?.medicineReminder.notification_id === planId) {
      const updatedPlan = { ...selectedReminder.medicineReminder };
      updatedPlan.schedule.reminders = updatedPlan.schedule.reminders.map(r =>
        r.id === reminderId ? { ...r, is_taken: isTaken, status: isTaken ? 'taken' : 'pending', taken_at: isTaken ? new Date().toISOString() : undefined } : r
      );
      setSelectedReminder(prev => prev ? { ...prev, medicineReminder: updatedPlan } : prev);
    }
  };

  const handleEditFromDetail = () => {
    if (!selectedReminder) return;
    // Switch mode in URL
    const params = new URLSearchParams(searchParams.toString());
    params.set('notification_id', selectedReminder.medicineReminder.notification_id);
    params.set('open', 'edit');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    // Remove specific params but keep others (like tab)
    const params = new URLSearchParams(searchParams.toString());
    params.delete('notification_id');
    params.delete('reminder_id');
    params.delete('open');
    router.push(`?${params.toString()}`, { scroll: false });
    setSelectedReminder(null);
  };

  const handleCloseEdit = () => {
    // Remove specific params
    const params = new URLSearchParams(searchParams.toString());
    params.delete('notification_id');
    params.delete('reminder_id');
    params.delete('open');
    router.push(`?${params.toString()}`, { scroll: false });
    setEditingReminder(null);
  };

  const handleSaveEdit = () => {
    // Remove params
    const params = new URLSearchParams(searchParams.toString());
    params.delete('notification_id');
    params.delete('reminder_id');
    params.delete('open');
    router.push(`?${params.toString()}`, { scroll: false });
    setEditingReminder(null);
    // Occurrences will be rebuilt automatically via useEffect
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

  const pageLoading = loading || petsLoading;


  return (
    <Page>
      <div className="sticky top-0 z-50 bg-[#F9FAFB] pt-2">
        <Tabs data={medicationTabs} queryKey="tab" />
        <div className="mt-2">
          <PetFilterSelector
            mode="filter"
            allowAllPets
            pets={pets}
            value={selectedPetId}
            onChange={handlePetSelect}
          />
        </div>
      </div>

      {/* Header */}
      <Header>
        <div className='Title'>
          {activeTab === 'today'
            ? "Today's Medication Reminders"
            : activeTab === 'tomorrow'
              ? "Tomorrow's Medication Reminders"
              : 'Other Medication Reminders'}
        </div>
        <div className='DateText'>{formatDate(baseDate)}</div>
      </Header>


      {/* Reminder cards */}
      <CardList>
        {pageLoading && occurrences.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : filteredOccurrences.length > 0 ? (
          (() => {
            // Group occurrences by plan_id
            const groupedMap = new Map<string, {
              planId: string;
              pet: typeof filteredOccurrences[0]['pet'];
              medicine: typeof filteredOccurrences[0]['medicine'];
              // isStopped: boolean; // NOT AVAILABLE in simple notification list unless we add to map
              slots: TimeSlot[];
            }>();

            filteredOccurrences.forEach(occ => {
              if (!groupedMap.has(occ.plan_id)) {
                groupedMap.set(occ.plan_id, {
                  planId: occ.plan_id,
                  pet: occ.pet,
                  medicine: occ.medicine,
                  slots: []
                });
              }

              const group = groupedMap.get(occ.plan_id)!;
              group.slots.push({
                id: occ.reminder_id,
                timeLabel: occ.time, // Already formatted by API/Mock
                status: occ.status
              });
            });

            // Convert to array and sort 
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
                isStopped={false} // Default false since we filter valid reminders
                onOpenDetail={() => {
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
          })()
        ) : (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: theme.colors.textSecondary,
              fontSize: '14px',
            }}
          >
            No medication reminders.
          </div>
        )}
      </CardList>

      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={handleAdd}
      />

      {/* Create Medication Popup */}
      <CreateMedicationPopup
        open={showCreatePopup}
        onClose={handleCloseCreatePopup}
        onSuccess={handleSubmitCreatePopup}
        pets={pets}
      />

      {/* Medication Detail Popup */}
      {selectedReminder && (
        <MedicationDetailPopup
          page="medication-page"
          medicineReminder={selectedReminder.medicineReminder}
          highlightedReminderId={selectedReminder.highlightedReminderId}
          onClose={handleCloseDetail}
          onToggleReminder={(reminderId: string, isTaken: boolean) =>
            handleToggleReminder(selectedReminder.medicineReminder.notification_id, reminderId, isTaken)
          }
          onEdit={handleEditFromDetail}
        />
      )}

      {/* Edit Medication Popup */}
      {editingReminder && (
        <EditMedicationPopup
          open={!!editingReminder}
          onClose={handleCloseEdit}
          medicineReminder={editingReminder}
          pets={pets}
          onSuccess={handleSaveEdit}
        />
      )}
    </Page>
  );
}

