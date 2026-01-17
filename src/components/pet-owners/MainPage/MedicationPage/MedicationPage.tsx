'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Page,
  Header,
  CardList,
} from '@/styles/medication.styled';
import { PetId } from '@/types/pet';
import { theme } from '@/styles/theme';
import { Tabs } from '@/components/pet-owners/shared/Tabs';
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import { QuickDialButton } from '@/components/pet-owners/shared/QuickDialButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
  getMedications,
  getMedicationDetail,
  markMedicationTaken,
  deleteMedicine,
  authStorage
} from '@/lib/api-client';
import {
  formatTimeForDisplay,
  getUserTimezone,
  ReminderOccurrence
} from '@/lib/reminder-utils';
import MedicineCard, { TimeSlot } from './MedicineCard';
import CreateMedicationPopup from './AddMedicationPopup';
import EditMedicationPopup from './EditMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';

// Hooks
import { usePets } from '@/lib/hooks/usePets';

// Types
import { MedicineReminderVM } from '@/types/medicine-reminder';

type TabType = 'today' | 'tomorrow' | 'other';

export default function MedicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [occurrences, setOccurrences] = useState<ReminderOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    }
    return d;
  };

  const baseDate = getDateForTab(activeTab);

  // Helper: Extract HH:mm from ISO
  const formatTimeForDisplayFromDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return formatTimeForDisplay(`${hours}:${minutes}`);
    } catch (e) {
      return formatTimeForDisplay("00:00");
    }
  };

  const fetchReminders = useCallback(async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const dateObj = getDateForTab(activeTab);
        const ymd = new Intl.DateTimeFormat('en-CA', {
          timeZone: getUserTimezone(),
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(dateObj);

        // API Call: Always pass date param to get occurrences
        // Filter by Pet ID if selected
        const petIdParam = selectedPetId === 'all' ? undefined : selectedPetId;
        const dateParam = activeTab === 'other' ? undefined : ymd;

        // The API returns differently when date is passed:
        // With date -> JSON array of "Notification" objects (like DashboardNotification)
        const data = await getMedications(token, petIdParam, dateParam);

        console.log('API Response:', data);

        // Map API response to ReminderOccurrence
        const mapped: ReminderOccurrence[] = Array.isArray(data) ? data.map((item: any) => ({
          occurrence_id: `occ_${item._id}`, // unique key
          plan_id: item.medicine_id, // Use medicine_id consistently for grouping
          reminder_id: item._id, // the notification id itself acts as reminder instance id
          frequency_label: item.frequency_label || "Daily", // Better default than "Scheduled"
          time: formatTimeForDisplayFromDate(item.notification_at),
          pet: {
            _id: item.pet_id,
            name: item.pet_name,
            profile_image: item.pet_image || '/pets-example/pet-ex1.svg' // Default image
          },
          medicine: {
            _id: item.medicine_id,
            name: item.medicine_name,
            dosage: item.dosage // undefined if missing - let component handle display
          },
          scheduled_at: item.notification_at,
          status: (item.status || (item.istaken ? 'taken' : 'pending')) as any,
          taken_at: item.taken_at
        })) : [];

        setOccurrences(mapped.sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        ));

      } catch (apiErr: any) {
        console.warn('API failed:', apiErr?.message);
        setError('Failed to load medications');
        setOccurrences([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load medication reminders');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedPetId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Deep link handling (updated to fetch detail if needed)
  useEffect(() => {
    if (loading) return;
    const notificationId = searchParams.get('notification_id');
    const reminderId = searchParams.get('reminder_id');
    const openMode = searchParams.get('open');

    if (!notificationId) return;

    // We don't have all plans loaded, so we might need to fetch the plan for the deeplinked item
    // For now, let's just trigger the edit popup if 'edit' mode, which requires fetching detail
    const fetchAndOpen = async () => {
      try {
        const token = authStorage.getToken();
        if (!token) return;
        const detail = await getMedicationDetail(token, notificationId);

        if (openMode === 'edit') {
          setEditingReminder(detail);
        } else {
          setSelectedReminder({
            medicineReminder: detail,
            highlightedReminderId: reminderId || undefined,
          });
        }
      } catch (e) { console.error("Deeplink fetch failed", e); }
    };

    fetchAndOpen();

    window.history.replaceState({}, '', '/pet-owners/medication-page');
  }, [searchParams, loading]);


  // No separate filtering step needed if API does filtering, but we might want to filter by pet if user switches selector
  // client-side filtering backup if needed, but we rely on API mostly
  const filteredOccurrences = useMemo(() => {
    // If we rely on API for pet filtering, we might not need this.
    // However, if we change pet filter, we trigger fetchReminders.
    // So this is just a passthrough currently, or sanity check.
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
    // API is now called inside the popup
    setShowCreatePopup(false);
    fetchReminders(); // Refresh from server
  };

  const handleReminderClick = async (occ: ReminderOccurrence) => {
    // Fetch full plan details before showing
    try {
      const token = authStorage.getToken();
      if (!token) return;
      const plan = await getMedicationDetail(token, occ.plan_id);
      setSelectedReminder({
        medicineReminder: plan,
        highlightedReminderId: occ.reminder_id,
      });
    } catch (e) { console.error("Failed to fetch detail", e); }
  };

  const handleEditFromCard = async (occ: ReminderOccurrence) => {
    // Fetch full plan and set editing
    try {
      const token = authStorage.getToken();
      if (!token) return;
      const plan = await getMedicationDetail(token, occ.plan_id);
      setEditingReminder(plan);
      setSelectedReminder(null);
    } catch (e) { console.error("Failed to fetch detail for edit", e); }
  };

  const handleDeleteFromCard = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const token = authStorage.getToken();
        if (token) {
          // In the new model, we might need medicine_id. 
          // PlanId usually maps to notification_id? 
          // Let's assume planId is notification_id. We need medicine_id to delete.
          // We can find it from occurrences.
          const occ = occurrences.find(o => o.plan_id === planId);
          if (occ) {
            console.log("Deleting plan:", planId, "medicine:", occ.medicine._id);
            await deleteMedicine(token, planId, occ.medicine._id);
            // Update local state by removing all occurrences for this plan
            setOccurrences(prev => prev.filter(o => o.plan_id !== planId));
          }
        }
      } catch (err) {
        console.error(err);
        alert("Failed to delete medication");
      }
    }
  };

  const handleToggleReminder = async (planId: string, reminderId: string, isTaken: boolean) => {
    // Optimistic update for Occurrences List
    const updatedOccurrences = occurrences.map(occ => {
      if (occ.reminder_id === reminderId) {
        return {
          ...occ,
          status: isTaken ? 'taken' : 'pending' as any,
          taken_at: isTaken ? new Date().toISOString() : undefined
        };
      }
      return occ;
    });
    setOccurrences(updatedOccurrences);

    // If detail is open, we should technically update it too, but selectedReminder is separate state.
    // Optimistic update selectedReminder
    if (selectedReminder?.medicineReminder.notification_id === planId) {
      const updatedPlan = { ...selectedReminder.medicineReminder };
      updatedPlan.schedule.reminders = updatedPlan.schedule.reminders.map(r =>
        r.id === reminderId ? { ...r, is_taken: isTaken, status: isTaken ? 'taken' : 'pending' } : r
      );
      setSelectedReminder(prev => prev ? { ...prev, medicineReminder: updatedPlan } : prev);
    }

    try {
      const token = authStorage.getToken();
      if (token) {
        // Mark the medication notification as taken/untaken
        await markMedicationTaken(token, reminderId, isTaken);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
      fetchReminders(); // Revert to server state
    }
  };

  const handleEditFromDetail = () => {
    if (!selectedReminder) return;
    setEditingReminder(selectedReminder.medicineReminder);
    setSelectedReminder(null);
  };

  const handleCloseDetail = () => {
    setSelectedReminder(null);
  };

  const handleCloseEdit = () => {
    setEditingReminder(null);
  };

  const handleSaveEdit = () => {
    // API is now called inside the popup
    setEditingReminder(null);
    fetchReminders(); // Refresh from server
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
                timeLabel: formatTimeForDisplayFromDate(occ.scheduled_at), // use local helper for ISO or imported one if HH:mm string
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