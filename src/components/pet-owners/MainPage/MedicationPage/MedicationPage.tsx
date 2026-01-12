'use client';

import { useState, useEffect } from 'react';
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
import {
  formatTimeForDisplay,
  updateReminderTakenStatus,
  ReminderOccurrence,
  flattenRemindersForDate,
  buildOccurrencesForDate
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
  const [highlightedOccurrenceId, setHighlightedOccurrenceId] = useState<string | null>(null);
  const [occurrenceOverrides, setOccurrenceOverrides] = useState<Record<string, { status: any; taken_at?: string | null }>>({});

  // Handle deep linking
  useEffect(() => {
    const notificationId = searchParams.get('notification_id');
    const reminderId = searchParams.get('reminder_id');
    const openMode = searchParams.get('open');

    if (notificationId) {
      const medicineReminder = medicineReminders.find(
        mr => mr.notification_id === notificationId
      );

      if (medicineReminder && !medicineReminder.medication_status.is_stopped) {
        if (openMode === 'edit') {
          // Open edit popup directly
          setEditingReminder(medicineReminder);
        } else {
          // Open detail popup
          setSelectedReminder({
            medicineReminder,
            highlightedReminderId: reminderId || undefined,
          });
        }

        // Highlight the specific occurrence
        if (reminderId) {
          setHighlightedOccurrenceId(`${notificationId}-${reminderId}`);
        }

        // Clean URL after opening (optional)
        window.history.replaceState({}, '', '/pet-owners/medication-page');
      } else if (medicineReminder?.medication_status.is_stopped) {
        // Show message for stopped medication
        alert('This medication reminder is no longer active.');
      }
    }
  }, [searchParams, medicineReminders]);

  const tzToday = new Date();
  const tzTomorrow = new Date(); tzTomorrow.setDate(tzTomorrow.getDate() + 1);

  const occurrences =
    selectedTab === "today"
      ? buildOccurrencesForDate(medicineReminders, tzToday, occurrenceOverrides)
      : selectedTab === "tomorrow"
      ? buildOccurrencesForDate(medicineReminders, tzTomorrow, occurrenceOverrides)
      : []; // other ทำทีหลัง หรือทำ range

  const filtered = occurrences.filter(o => selectedPetId === "all" || o.pet.id === selectedPetId);


  const getDateForTab = (tab: TabType): Date => {
    const today = new Date();
    if (tab === "today") return today;
    if (tab === "tomorrow") {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d;
    }
    // other: เอาเป็น “อีก 7 วันถัดไป (ไม่รวมวันนี้/พรุ่งนี้)” ชั่วคราวก่อนต่อ API
    // เดี๋ยวเฟส B จะเปลี่ยนเป็น occurrences จาก server
    return today;
  };

  // Get today's reminders
  const baseDate = getDateForTab(selectedTab);

  const tabReminders =
    selectedTab === "other"
      ? [] // ชั่วคราวก่อน (ถ้าจะทำจริงให้ทำในเฟส B)
      : flattenRemindersForDate(medicineReminders, baseDate).sort(
          (a, b) => a.occurrence_datetime.getTime() - b.occurrence_datetime.getTime()
        );
  
  // Filter by selected pet
  const filteredReminders = tabReminders.filter(occurrence =>
    selectedPetId === 'all' || occurrence.pet.id === selectedPetId
  );

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
    // Add the new medication to the state
    setMedicineReminders([...medicineReminders, newMedicineReminder]);
    setShowCreatePopup(false);
  };

  const handleReminderClick = (occurrence: ReminderOccurrence) => {
    const medicineReminder = medicineReminders.find(
      mr => mr.notification_id === occurrence.notification_id
    );
    
    if (medicineReminder) {
      setSelectedReminder({
        medicineReminder,
        highlightedReminderId: occurrence.reminder_id,
      });
    }
  };

  const handleToggleReminder = (notificationId: string, reminderId: string, isTaken: boolean) => {
    const updatedReminders = updateReminderTakenStatus(
      medicineReminders,
      notificationId,
      reminderId,
      isTaken
    );

    setMedicineReminders(updatedReminders);

    // sync selectedReminder ถ้ากำลังเปิด detail ของตัวเดียวกัน
    if (selectedReminder?.medicineReminder.notification_id === notificationId) {
      const updatedMedicineReminder = updatedReminders.find(mr => mr.notification_id === notificationId);
      if (updatedMedicineReminder) {
        setSelectedReminder({
          ...selectedReminder,
          medicineReminder: updatedMedicineReminder,
        });
      }
    }
  };


  const handleEditFromDetail = () => {
    if (!selectedReminder) return;
    
    setEditingReminder(selectedReminder.medicineReminder);
    setSelectedReminder(null);
  };

  const handleCloseDetail = () => {
    setSelectedReminder(null);
    setHighlightedOccurrenceId(null);
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
          // ก่อนต่อ API: อย่าเพิ่ง set stopped_at ด้วย new Date() (ควรเป็น server)
          // ให้โชว์เฉพาะ flag ไปก่อน
          ...(data.isStopped ? { reason: data.reason } : {}),
        },
      };
    });

    setMedicineReminders(updated);
    setEditingReminder(null);
  };

  const formatDate = (): string => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  return (
    <Page>
      {/* Pet selector */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <PetSelectButton onClick={() => setPetDropdownOpen((open) => !open)}>
          <div className='PetIcon'>
            {selectedPetId === 'all' ? (
              <Pets />
            ) : (
              <Image
                src={mockPets.find((p) => p.id === selectedPetId)?.avatarUrl || ''}
                alt={mockPets.find((p) => p.id === selectedPetId)?.name || ''}
                width={48}
                height={48}
                style={{ borderRadius: '50%', background: '#f1f2f4' }}
              />
            )}
          </div>
          <div className='PetSelectText'>
            {selectedPetId === 'all'
              ? 'All Pets'
              : mockPets.find((p) => p.id === selectedPetId)?.name || 'All Pets'}
          </div>
          <div className='ChevronIcon'>
            <ExpandMore />
          </div>
        </PetSelectButton>
        {petDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: `${theme.colors.white}`,
            color: `${theme.colors.textPrimary}`,
            border: '1px solid #eee',
            borderRadius: 8,
            zIndex: 10,
            width: '100%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
            <div
              style={{ padding: 12, cursor: 'pointer', borderBottom: '1px solid #eee' }}
              onClick={() => handlePetSelect('all')}
            >
              All Pets
            </div>
            {mockPets.map((pet) => (
              <div
                key={pet.id}
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  color: '#000',
                  borderBottom: pet.id !== mockPets[mockPets.length - 1].id ? '1px solid #eee' : 'none'
                }}
                onClick={() => handlePetSelect(pet.id)}
              >
                <Image src={pet.avatarUrl || ''} alt={pet.name} width={24} height={24} style={{ borderRadius: '50%', marginRight: 8 }} />
                {pet.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <TabsWrap>
        <TabButton
          $active={selectedTab === 'today'}
          onClick={() => handleTabChange('today')}
        >
          Today
        </TabButton>
        <TabButton
          $active={selectedTab === 'tomorrow'}
          onClick={() => handleTabChange('tomorrow')}
        >
          Tomorrow
        </TabButton>
        <TabButton
          $active={selectedTab === 'other'}
          onClick={() => handleTabChange('other')}
        >
          Other
        </TabButton>
      </TabsWrap>

      {/* Header */}
      <Header>
        <div className='Title'>
          {selectedTab === "today" ? "Today's Medication Reminders" :
          selectedTab === "tomorrow" ? "Tomorrow's Medication Reminders" :
          "Other Medication Reminders"}
        </div>
        <div className='DateText'>{formatDate()}</div>
      </Header>

      {/* Reminder cards */}
      <CardList>
        {filteredReminders.length > 0 ? (
          filteredReminders.map((occ) => (
          <MedicineCard
            key={`${occ.notification_id}-${occ.reminder_id}-${occ.occurrence_datetime.toISOString()}`}
            petName={occ.pet.name}
            petImageUrl={occ.pet.image_url}
            medicineName={occ.medicine.name}
            dosage={occ.medicine.dosage}
            timeLabel={formatTimeForDisplay(occ.time)}
            status={occ.status}
            isStopped={occ.medication_status?.is_stopped}
            onOpenDetail={() => handleReminderClick(occ)}
            onToggleTaken={(next) =>
              handleToggleReminder(occ.notification_id, occ.reminder_id, next)
            }
            onEdit={() => handleEditFromDetail()}
          />
        ))
        ) : (
          <div style={{
            padding: '32px 16px',
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontSize: '14px'
          }}>
            No medication reminders today.
          </div>
        )}
      </CardList>

      <QuickDialButton
        iconColor='#fff'
        position={'bottom-right'}
        icon={<AddRoundedIcon/>}
        color={'#09BFF8'}
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