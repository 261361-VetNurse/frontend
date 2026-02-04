'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Page,
  Header,
  CardList,
} from '@/styles/components/medication.styled';
import { theme } from '@/styles/tokens/theme';
import { Tabs } from '@/components/pet-owners/shared/Tabs';
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import { QuickDialButton } from '@/components/pet-owners/shared/QuickDialButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { PetId } from '@/types/domain/pet';
import { EachDayMedicine, Medicine } from '@/types/domain/medication';
import MedicineCard from './MedicineCard';
import CreateMedicationPopup from './AddMedicationPopup';
import EditMedicationPopup from './EditMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';

// Hooks
import { usePets } from '@/hooks';

// API
import {
  authStorage,
  getMedications,
  getMedicineDetail,
  createMedicine,
  deleteMedicine,
  markMedicationTaken
} from '@/services/api/client';

type TabType = 'today' | 'tomorrow' | 'other';

export default function MedicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [medicines, setMedicines] = useState<EachDayMedicine[]>([]);
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
    medicineReminder: any; // Medicine or detailed object
    highlightedReminderId?: string;
  } | null>(null);

  const [editingReminder, setEditingReminder] = useState<Medicine | null>(null);

  // Helper: Get Date for Tab
  const getDateForTab = (tab: TabType): Date => {
    const d = new Date();
    if (tab === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (tab === 'other') {
      d.setDate(d.getDate() + 2);
    }
    return d;
  };

  const baseDate = getDateForTab(activeTab);

  const fetchReminders = useCallback(async () => {
    setLoading(true);

    try {
      const token = authStorage.getToken() || "";
      const dateForTab = getDateForTab(activeTab);
      const dateStr = dateForTab.toISOString().split('T')[0];

      const data: EachDayMedicine[] = await getMedications(token, selectedPetId === 'all' ? undefined : selectedPetId, dateStr);
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedPetId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Deep link handling
  // Deep link handling
  useEffect(() => {
    const notificationId = searchParams.get('noti_id');
    const medicineId = searchParams.get('med_id');
    const openMode = searchParams.get('open');

    const handleDeepLink = async () => {
      if (!notificationId || !medicineId) return;
      try {
        const token = authStorage.getToken() || "";
        const detail = await getMedicineDetail(token, notificationId, medicineId);
        if (detail) {
          if (openMode === 'edit') {
            setEditingReminder(detail);
            setSelectedReminder(null);
          } else {
            setSelectedReminder({
              medicineReminder: detail,
              highlightedReminderId: medicineId
            });
            setEditingReminder(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    handleDeepLink();
  }, [searchParams]);


  const handlePetSelect = (petId: string) => {
    setSelectedPetId(petId);
  };

  const handleAdd = () => {
    setShowCreatePopup(true);
  };

  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
  };

  const handleReminderClick = async (noti: EachDayMedicine) => {
    try {
      const token = authStorage.getToken() || "";
      // Using _id as notificationId (based on client.ts L214 returning mockEachDayMedicines where _id is used)
      const detail = await getMedicineDetail(token, noti._id, noti.medicine_id);
      setSelectedReminder({
        medicineReminder: detail,
        highlightedReminderId: undefined
      });

      const params = new URLSearchParams(searchParams.toString());
      params.set('noti_id', noti._id);
      params.set('med_id', noti.medicine_id);
      router.push(`?${params.toString()}`, { scroll: false });

    } catch (e) {
      console.error("Failed to load detail", e);
    }
  };

  const handleEditFromCard = async (med: EachDayMedicine) => {
    try {
      const token = authStorage.getToken() || "";
      const detail = await getMedicineDetail(token, med._id, med.medicine_id);
      setEditingReminder(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditFromDetail = () => {
    if (selectedReminder) {
      setEditingReminder(selectedReminder.medicineReminder);
      setSelectedReminder(null);
    }
  };

  const handleDelete = async (notificationId: string, medicineId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const token = authStorage.getToken() || "";
        await deleteMedicine(token, notificationId, medicineId);
        fetchReminders();
      } catch (err) {
        console.error(err);
        alert("Failed to delete medication");
      }
    }
  };

  const handleToggleReminder = async (notificationId: string, reminderId: string, isTaken: boolean) => {
    try {
      const token = authStorage.getToken() || "";
      await markMedicationTaken(token, notificationId, isTaken);
      fetchReminders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCloseDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('noti_id');
    params.delete('med_id');
    params.delete('open');
    router.push(`?${params.toString()}`, { scroll: false });
    setSelectedReminder(null);
  };

  const handleCloseEdit = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('noti_id');
    params.delete('med_id');
    params.delete('open');
    router.push(`?${params.toString()}`, { scroll: false });
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

      <CardList>
        {pageLoading && medicines.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : medicines.length > 0 ? (
          medicines.map((med) => (
            <MedicineCard
              key={`${med._id}_${med.medicine_id}`}
              petName={med.pet_name}
              petImageUrl={med.pet_image}
              medicineName={med.medicine_name}
              dosage={med.medicine_dosage}
              times={(med.reminder_time || []).map((t, idx) => ({
                id: `${med._id}_${t}`,
                timeLabel: t,
                status: 'pending'
              }))}
              isStopped={false}
              onOpenDetail={() => handleReminderClick(med)}
              onToggleTaken={(reminderId, next) =>
                handleToggleReminder(med._id, reminderId, next)
              }
              onEdit={() => handleEditFromCard(med)}
              onDelete={() => handleDelete(med._id, med.medicine_id)}
            />
          ))
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

      <CreateMedicationPopup
        open={showCreatePopup}
        onClose={handleCloseCreatePopup}
        onSuccess={() => { setShowCreatePopup(false); fetchReminders(); }}
        pets={pets}
      />

      {selectedReminder && (
        <MedicationDetailPopup
          page="medication-page"
          medicineReminder={selectedReminder.medicineReminder}
          highlightedReminderId={selectedReminder.highlightedReminderId}
          onClose={handleCloseDetail}
          onToggleReminder={(reminderId: string, isTaken: boolean) =>
            handleToggleReminder(selectedReminder.medicineReminder._id, reminderId, isTaken)
          }
          onEdit={handleEditFromDetail}
        />
      )}

      {editingReminder && (
        <EditMedicationPopup
          open={!!editingReminder}
          onClose={handleCloseEdit}
          medicineReminder={editingReminder}
          pets={pets}
          onSuccess={() => { setEditingReminder(null); fetchReminders(); }}
        />
      )}
    </Page>
  );
}
