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
  buildOccurrencesForDate,
  ReminderOccurrence
} from '@/utils/reminder-utils';
import MedicineCard, { TimeSlot } from './MedicineCard';
import CreateMedicationPopup from './AddMedicationPopup';
import EditMedicationPopup from './EditMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';

// Hooks
import { usePets } from '@/hooks';

// Types
import { MedicineReminderVM } from '@/types/domain/medication';

// Mock Data
import { mockMedicineReminderVMs } from '@/mocks/medicine-reminders.mock';

type TabType = 'today' | 'tomorrow' | 'other';

export default function MedicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State - using local mock data instead of API
  const [medicationPlans, setMedicationPlans] = useState<MedicineReminderVM[]>(mockMedicineReminderVMs);
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
  const fetchReminders = useCallback(() => {
    setLoading(true);

    try {
      const dateForTab = getDateForTab(activeTab);

      // Use buildOccurrencesForDate to generate occurrences
      const allOccurrences = buildOccurrencesForDate(medicationPlans, dateForTab);

      // Filter by selected pet if needed
      const filtered = selectedPetId === 'all'
        ? allOccurrences
        : allOccurrences.filter(occ => occ.pet._id === selectedPetId);

      // Sort by scheduled time
      const sorted = filtered.sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );

      setOccurrences(sorted);
    } catch (err) {
      console.error('Error building occurrences:', err);
      setOccurrences([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedPetId, medicationPlans]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Deep link handling (updated to use mock data)
  useEffect(() => {
    if (loading) return;
    const notificationId = searchParams.get('notification_id');
    const reminderId = searchParams.get('reminder_id');
    const openMode = searchParams.get('open');

    if (!notificationId) return;

    // Find the plan from mock data
    const plan = medicationPlans.find(p => p.notification_id === notificationId);

    if (plan) {
      if (openMode === 'edit') {
        setEditingReminder(plan);
      } else {
        setSelectedReminder({
          medicineReminder: plan,
          highlightedReminderId: reminderId || undefined,
        });
      }
    }

    window.history.replaceState({}, '', '/pet-owners/medication-page');
  }, [searchParams, loading, medicationPlans]);


  // Filtered occurrences - filtering is already done in fetchReminders
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
    // Close popup - in a real implementation, this would add to medicationPlans
    setShowCreatePopup(false);
    // Refresh occurrences (will be rebuilt from medicationPlans)
    fetchReminders();
  };

  const handleReminderClick = (occ: ReminderOccurrence) => {
    // Find the plan from mock data
    const plan = medicationPlans.find(p => p.notification_id === occ.plan_id);
    if (plan) {
      setSelectedReminder({
        medicineReminder: plan,
        highlightedReminderId: occ.reminder_id,
      });
    }
  };

  const handleEditFromCard = (occ: ReminderOccurrence) => {
    // Find the plan from mock data and set editing
    const plan = medicationPlans.find(p => p.notification_id === occ.plan_id);
    if (plan) {
      setEditingReminder(plan);
      setSelectedReminder(null);
    }
  };

  const handleDeleteFromCard = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        // Remove from medicationPlans
        setMedicationPlans(prev => prev.filter(p => p.notification_id !== planId));
        // Update occurrences will happen automatically via useEffect
      } catch (err) {
        console.error(err);
        alert("Failed to delete medication");
      }
    }
  };

  const handleToggleReminder = (planId: string, reminderId: string, isTaken: boolean) => {
    // Update medicationPlans with the new status
    setMedicationPlans(prev => prev.map(plan => {
      if (plan.notification_id !== planId) return plan;

      return {
        ...plan,
        schedule: {
          ...plan.schedule,
          reminders: plan.schedule.reminders.map(r => {
            if (r.id !== reminderId) return r;
            return {
              ...r,
              is_taken: isTaken,
              status: isTaken ? 'taken' : 'pending',
              taken_at: isTaken ? new Date().toISOString() : undefined
            };
          })
        }
      };
    }));

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
    // Close the edit popup - changes are handled by the popup
    setEditingReminder(null);
    // Occurrences will be rebuilt automatically via useEffect
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
                timeLabel: occ.time, // Already formatted by buildOccurrencesForDate
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

