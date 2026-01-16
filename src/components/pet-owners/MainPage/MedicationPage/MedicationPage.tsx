'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import CreateMedicationPopup from './AddMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';
import EditMedicationPopup from './EditMedicationPopup';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Image from 'next/image';
import {
  Page,
  PetSelectButton,
  TabsWrap,
  TabButton,
  Header,
  CardList,
} from '../../../../styles/medication.styled';
import { Pets, ExpandMore } from '@mui/icons-material';
import { theme } from '@/styles/theme';
import { QuickDialButton } from '../../shared/QuickDialButton';
import { mockMedicineReminderVMs } from '@/mocks/medicine-reminders.mock';
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
import MedicineCard from './MedicineCard';

// Types
type TabType = 'today' | 'tomorrow' | 'other';
type PetId = 'all' | string;

interface Pet {
  id: string;
  name: string;
  avatarUrl?: string;
}

// Mock pets data
const mockPets: Pet[] = [
  { id: '65f1a9c2b0f3c1a2d3e4f601', name: 'Mochi', avatarUrl: 'https://picsum.photos/seed/mochi/200/200' },
  { id: '65f1a9c2b0f3c1a2d3e4f602', name: 'Taro', avatarUrl: 'https://picsum.photos/seed/taro/200/200' },
  { id: '65f1a9c2b0f3c1a2d3e4f603', name: 'Luna', avatarUrl: 'https://picsum.photos/seed/luna/200/200' },
];

type OccurrenceOverride = { status: OccurrenceStatus; taken_at?: string | null };

function ymdInUserTz(date: Date): string {
  // keep it simple & deterministic in Bangkok for now
  // (avoid depending on client OS timezone formatting)
  const userTz = getUserTimezone();
  // If you already have a dayjs helper, you can replace this.
  // Here we rely on reminder-utils to build ISO in TZ; for ymd we can use locale date parts safely if OS TZ == Bangkok.
  // Better: add/export a helper from reminder-utils; but this is enough to fix the page compile.
  const d = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  // en-CA => YYYY-MM-DD
  return d;
}

export default function MedicationPage() {
  const searchParams = useSearchParams();

  const [medicineReminders, setMedicineReminders] = useState<MedicineReminderVM[]>(mockMedicineReminderVMs);
  const [selectedTab, setSelectedTab] = useState<TabType>('today');
  const [selectedPetId, setSelectedPetId] = useState<PetId>('all');
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const [selectedReminder, setSelectedReminder] = useState<{
    medicineReminder: MedicineReminderVM;
    highlightedReminderId?: string;
  } | null>(null);

  const [editingReminder, setEditingReminder] = useState<MedicineReminderVM | null>(null);

  // Keep for later (skip/missed); buildOccurrencesForDate accepts this shape
  const [occurrenceOverrides, setOccurrenceOverrides] = useState<Record<string, OccurrenceOverride>>({});

  const getDateForTab = (tab: TabType): Date => {
    const today = getTodayInLocalTimezone();
    if (tab === 'today') return today;

    if (tab === 'tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d;
    }

    // other: placeholder range (day+2..day+7)
    return today;
  };

  const baseDate = getDateForTab(selectedTab);

  const occurrences: ReminderOccurrence[] = useMemo(() => {
    const today = getTodayInLocalTimezone();

    if (selectedTab === 'today') {
      return buildOccurrencesForDate(medicineReminders, today, occurrenceOverrides);
    }

    if (selectedTab === 'tomorrow') {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return buildOccurrencesForDate(medicineReminders, d, occurrenceOverrides);
    }

    // other: day+2..day+7 (รวม 6 วัน) — ชั่วคราวก่อนต่อ server
    const out: ReminderOccurrence[] = [];
    for (let i = 2; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      out.push(...buildOccurrencesForDate(medicineReminders, d, occurrenceOverrides));
    }

    return out.sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  }, [selectedTab, medicineReminders, occurrenceOverrides]);

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(o => selectedPetId === 'all' || o.pet._id === selectedPetId);
  }, [occurrences, selectedPetId]);

  // Deep link: ?notification_id=...&reminder_id=...&open=edit
  useEffect(() => {
    const notificationId = searchParams.get('notification_id'); // plan_id == notification_id
    const reminderId = searchParams.get('reminder_id');
    const openMode = searchParams.get('open');

    if (!notificationId) return;

    const plan = medicineReminders.find(mr => mr.notification_id === notificationId);

    if (!plan) return;

    if (plan.medication_status.is_stopped) {
      alert('This medication reminder is no longer active.');
      return;
    }

    if (openMode === 'edit') {
      setEditingReminder(plan);
    } else {
      setSelectedReminder({
        medicineReminder: plan,
        highlightedReminderId: reminderId || undefined,
      });
    }

    // Optional: highlight a specific occurrence_id for TODAY if reminderId present
    // (occurrence_id is plan_id + YYYY-MM-DD + HH:mm)
    if (reminderId) {
      const slot = plan.schedule.reminders.find(r => r.id === reminderId);
      if (slot) {
        const ymd = ymdInUserTz(getTodayInLocalTimezone());
        const occId = buildOccurrenceId(notificationId, ymd, slot.time);
        // If your MedicineCard supports highlight via prop, pass occId down.
        // For now we just compute it (no-op) to keep logic correct.
        void occId;
      }
    }

    window.history.replaceState({}, '', '/pet-owners/medication-page');
  }, [searchParams, medicineReminders]);

  const handleTabChange = (tab: TabType) => {
    setSelectedTab(tab);
  };

  const handlePetSelect = (petId: PetId) => {
    setSelectedPetId(petId);
    setPetDropdownOpen(false);
  };

  const handleAdd = () => {
    setShowCreatePopup(true);
  };

  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
  };

  const handleSubmitCreatePopup = (newMedicineReminder: MedicineReminderVM) => {
    setMedicineReminders(prev => [...prev, newMedicineReminder]);
    setShowCreatePopup(false);
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

  const handleDeleteFromCard = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      setMedicineReminders(prev => prev.filter(mr => mr.notification_id !== planId));
    }
  };

  const handleToggleReminder = (planId: string, reminderId: string, isTaken: boolean) => {
    const updated = updateReminderTakenStatus(medicineReminders, planId, reminderId, isTaken);
    setMedicineReminders(updated);

    // sync selectedReminder ถ้ากำลังเปิด detail ของ plan เดียวกัน
    if (selectedReminder?.medicineReminder.notification_id === planId) {
      const updatedPlan = updated.find(mr => mr.notification_id === planId);
      if (updatedPlan) {
        setSelectedReminder(prev =>
          prev ? { ...prev, medicineReminder: updatedPlan } : prev
        );
      }
    }

    // ถ้าคุณจะใช้ overrides เป็น source-of-truth (แทนการแก้ plan) ค่อยย้าย logic มาใส่ตรงนี้
    // setOccurrenceOverrides(prev => ({ ...prev, [occurrenceId]: { status: isTaken ? "taken" : "pending", taken_at: ... } }))
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

  const handleSaveEdit = (data: {
    medicineReminder: MedicineReminderVM;
    isStopped: boolean;
    reason?: string;
  }) => {
    const updated = medicineReminders.map(mr => {
      if (mr.notification_id !== data.medicineReminder.notification_id) return mr;

      return {
        ...data.medicineReminder,
        medication_status: {
          is_stopped: data.isStopped,
          ...(data.isStopped ? { reason: data.reason } : {}),
        },
      };
    });

    setMedicineReminders(updated);
    setEditingReminder(null);
  };

  const formatDate = (d: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  return (
    <Page>
      {/* Pet selector */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <PetSelectButton onClick={() => setPetDropdownOpen(open => !open)}>
          <div className="PetIcon">
            {selectedPetId === 'all' ? (
              <Pets />
            ) : (
              <Image
                src={mockPets.find(p => p.id === selectedPetId)?.avatarUrl || ''}
                alt={mockPets.find(p => p.id === selectedPetId)?.name || ''}
                width={48}
                height={48}
                style={{ borderRadius: '50%', background: '#f1f2f4' }}
              />
            )}
          </div>
          <div className="PetSelectText">
            {selectedPetId === 'all'
              ? 'All Pets'
              : mockPets.find(p => p.id === selectedPetId)?.name || 'All Pets'}
          </div>
          <div className="ChevronIcon">
            <ExpandMore />
          </div>
        </PetSelectButton>

        {petDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: theme.colors.white,
              color: theme.colors.textPrimary,
              border: '1px solid #eee',
              borderRadius: 8,
              zIndex: 10,
              width: '100%',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{ padding: 12, cursor: 'pointer', borderBottom: '1px solid #eee' }}
              onClick={() => handlePetSelect('all')}
            >
              All Pets
            </div>

            {mockPets.map(pet => (
              <div
                key={pet.id}
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  color: '#000',
                  borderBottom: pet.id !== mockPets[mockPets.length - 1].id ? '1px solid #eee' : 'none',
                }}
                onClick={() => handlePetSelect(pet.id)}
              >
                <Image
                  src={pet.avatarUrl || ''}
                  alt={pet.name}
                  width={24}
                  height={24}
                  style={{ borderRadius: '50%', marginRight: 8 }}
                />
                {pet.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <TabsWrap>
        <TabButton $active={selectedTab === 'today'} onClick={() => handleTabChange('today')}>
          Today
        </TabButton>
        <TabButton $active={selectedTab === 'tomorrow'} onClick={() => handleTabChange('tomorrow')}>
          Tomorrow
        </TabButton>
        <TabButton $active={selectedTab === 'other'} onClick={() => handleTabChange('other')}>
          Other
        </TabButton>
      </TabsWrap>

      {/* Header */}
      <Header>
        <div className="Title">
          {selectedTab === 'today'
            ? "Today's Medication Reminders"
            : selectedTab === 'tomorrow'
              ? "Tomorrow's Medication Reminders"
              : 'Other Medication Reminders'}
        </div>
        <div className="DateText">{formatDate(baseDate)}</div>
      </Header>

      {/* Reminder cards */}
      <CardList>
        {filteredOccurrences.length > 0 ? (
          (() => {
            // Group occurrences by plan_id
            const groupedMap = new Map<string, {
              planId: string;
              pet: typeof filteredOccurrences[0]['pet'];
              medicine: typeof filteredOccurrences[0]['medicine'];
              isStopped: boolean;
              slots: { id: string; timeLabel: string; status: any }[];
            }>();

            filteredOccurrences.forEach(occ => {
              const plan = medicineReminders.find(p => p.notification_id === occ.plan_id);
              const isStopped = plan?.medication_status.is_stopped ?? false;

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

            // Convert to array and sort (optional: sort by first slot time)
            const groupedList = Array.from(groupedMap.values()).sort((a, b) => {
              // Sort by the time of the first slot
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
                times={group.slots} // Pass all times
                isStopped={group.isStopped}
                onOpenDetail={() => {
                  // Open detail using the first occurrence as reference, or just planId
                  // We need an occurrence to trigger handleReminderClick logic which sets selectedReminder
                  // We can find any occurrence for this plan.
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
        onSubmit={handleSubmitCreatePopup}
        pets={mockPets}
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
          pets={mockPets}
          onSave={handleSaveEdit}
        />
      )}
    </Page>
  );
}