'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from '@/hooks/use-next-routing';
import {
  Page,
  Header,
  CardList,
} from '@/styles/components/medication.styled';
import { theme } from '@/styles/tokens/theme';
import { Tabs } from '@/components/pet-owners/shared/Tabs';
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import { QuickDialButton } from '@/components/pet-owners/shared/QuickDialButton';
// SVG icon wrapper replacing MUI icon
const AddRoundedIcon = () => <Image width={24} height={24} src="/add-new.svg" alt="add" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />;
import { GroupedMedicineNotification } from '@/types/domain/medication';
import MedicineCard from './MedicineCard';
import CreateMedicationPopup from './AddMedicationPopup';
import EditMedicationPopup from './EditMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';
import SectionError from "@/components/pet-owners/shared/SectionError";
import { getMedicationStatus } from "@/utils/medicationStatus";

// Hooks
import { usePets } from '@/hooks';

// API
import Image from '@/components/shared/Image';
import {
  authStorage,
  getMedications,
  getMedicationNotificationDetail,
  deleteMedicine,
  markMedicationTaken
} from '@/services/api/client';

type TabType = 'today' | 'tomorrow' | 'other';

export default function MedicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [medicineNoti, setMedicinesNoti] = useState<GroupedMedicineNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch pets
  const { pets, loading: petsLoading } = usePets();

  // Read active tab
  const activeTab = (searchParams.get('tab') as TabType) || 'today';
  const urlPetId = Number(searchParams.get('pet_id')) || 0;

  const [selectedPetId, setSelectedPetId] = useState<number>(urlPetId);
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const medicationTabs = [
    { name: "Today", path: "/pet-owners/medication-page?tab=today", params: "today" },
    { name: "Tomorrow", path: "/pet-owners/medication-page?tab=tomorrow", params: "tomorrow" },
    { name: "Other", path: "/pet-owners/medication-page?tab=other", params: "other" },
  ];

  const [selectedReminder, setSelectedReminder] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    medicineReminder: any; // Medicine or detailed object
    highlightedReminderId?: number;
  } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingReminder, setEditingReminder] = useState<any | null>(null);

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

  // Memoize baseDate to prevent infinite loop - only recalculate when activeTab changes
  const baseDate = useMemo(() => getDateForTab(activeTab), [activeTab]);

  const fetchMedicineNotiData = async (token: string, petId: number | undefined, date: string) => {
    try {
      setError(null);
      const petIdParam = selectedPetId === 0 ? undefined : selectedPetId;
      const data = await getMedications(token, petIdParam, date);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setMedicinesNoti(data as any); // Cast as any because getMedications return type might still be inferred as NotificationItem[] until we update client.ts
    } catch (error) {
      console.error('Error fetching medicine notifications:', error);
      setError('Failed to load medication reminders');
    }
  };

  // Deep link handling
  useEffect(() => {
    const notificationId = Number(searchParams.get('noti_id'));
    const medicineId = Number(searchParams.get('med_id'));
    const popupParam = searchParams.get('popup'); // "view-medication", "edit-medication", "add-medication"

    const handleDeepLink = async () => {
      if (popupParam === 'add-medication') {
        setShowCreatePopup(true);
        return;
      }

      if (!notificationId && !medicineId) return;
      try {
        const token = authStorage.getToken() || "";
        // If viewing detail, we need notification details
        if (popupParam === 'view-medication' && notificationId) {
          const detail = await getMedicationNotificationDetail(token, notificationId);
          if (detail) {
            setSelectedReminder({
              medicineReminder: detail,
              highlightedReminderId: medicineId
            });
            setEditingReminder(null);
          }
        } else if (popupParam === 'edit-medication' && (notificationId || medicineId)) {
          // Editing requires getting detail. In the new logic, we prefer using notificationId to fetch the latest reminder detail
          const detailId = notificationId || (medicineId ? Number(medicineId) : 0);
          if (detailId) {
            const detail = await getMedicationNotificationDetail(token, detailId);
            if (detail) {
              setEditingReminder(detail);
              setSelectedReminder(null);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    handleDeepLink();
  }, [searchParams]);

  const openCreatePopup = () => {
    setShowCreatePopup(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set('popup', 'add-medication');
    router.push(`?${params.toString()}`);
  };

  const closePopup = () => {
    setShowCreatePopup(false);
    setSelectedReminder(null);
    setEditingReminder(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('popup');
    params.delete('noti_id');
    params.delete('med_id');
    router.push(`?${params.toString()}`);
  };

  // Fetch medication data when tab, pet, or date changes
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    const date = baseDate.toISOString().split('T')[0];
    const petIdParam = selectedPetId === 0 ? undefined : selectedPetId;
    fetchMedicineNotiData(token, petIdParam, date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPetId, baseDate]);

  // Grouping Logic Removed - API returns grouped data
  const groupedMedicines = useMemo(() => {
    // Just filter by pet if needed
    let filtered = medicineNoti;

    // Check if the API now returns status/is_deleted (we need them in the backend to filter here)
    // Assuming backend returns status and is_deleted as part of GroupedMedicineNotification
    filtered = filtered.filter(m => {
      // @ts-ignore - Assuming these fields are added to the backend
      const isDeleted = m.is_deleted === true;
      // @ts-ignore - Assuming status is present
      const isStopped = m.status === 'STOP';

      return !isDeleted && !isStopped;
    });

    if (selectedPetId !== 0) {
      filtered = filtered.filter(m => m.pet_id === selectedPetId);
    }
    return filtered;
  }, [medicineNoti, selectedPetId]);
  const handlePetSelect = (petId: number | null) => {
    setSelectedPetId(petId || 0);
    const params = new URLSearchParams(searchParams.toString());
    if (petId === 0) {
      params.delete('pet_id');
    } else {
      params.set('pet_id', petId?.toString() || '');
    }
    router.push(`?${params.toString()}`);
  };

  const handleAdd = () => {
    openCreatePopup();
  };

  const handleReminderClick = async (notiId: number, medId: number) => {
    try {
      const token = authStorage.getToken() || "";
      const detail = await getMedicationNotificationDetail(token, notiId);
      setSelectedReminder({
        medicineReminder: detail,
        highlightedReminderId: undefined
      });

      const params = new URLSearchParams(searchParams.toString());
      params.set('popup', 'view-medication');
      params.set('noti_id', notiId.toString());
      params.set('med_id', medId.toString());
      router.push(`?${params.toString()}`);

    } catch (e) {
      console.error("Failed to load detail", e);
    }
  };

  const handleEditFromCard = async (notiId: number, medId: number) => {
    try {
      const token = authStorage.getToken() || "";
      const detail = await getMedicationNotificationDetail(token, notiId);
      setEditingReminder(detail);

      const params = new URLSearchParams(searchParams.toString());
      params.set('popup', 'edit-medication');
      params.set('med_id', medId.toString());
      params.set('noti_id', notiId.toString());
      router.push(`?${params.toString()}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditFromDetail = () => {
    if (selectedReminder) {
      setEditingReminder(selectedReminder.medicineReminder);
      setSelectedReminder(null);

      // Transition to Edit URL
      const params = new URLSearchParams(searchParams.toString());
      params.set('popup', 'edit-medication');
      // Use noti_id to fetch detail if available, or fall back to medicine id. But since we use getMedicationNotificationDetail, noti_id is best.
      const notiId = (selectedReminder.medicineReminder as any).notification_id;
      if (notiId) {
        params.set('noti_id', notiId.toString());
      }
      if (selectedReminder.medicineReminder?.medicine_id) {
        params.set('med_id', selectedReminder.medicineReminder.medicine_id.toString());
      }
      router.push(`?${params.toString()}`);
    }
  };

  const handleDelete = async (notificationId: string, medicineId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const token = authStorage.getToken() || "";
        await deleteMedicine(token, medicineId);
        const date = baseDate.toISOString().split('T')[0];
        fetchMedicineNotiData(token, selectedPetId, date);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleReminder = async (notificationId: number) => {
    try {
      const token = authStorage.getToken() || "";
      await markMedicationTaken(token, notificationId);
      const date = baseDate.toISOString().split('T')[0];
      fetchMedicineNotiData(token, selectedPetId, date);
    } catch (e) {
      console.error(e);
    }
  };



  const formatDate = (d: Date): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  const pageLoading = petsLoading;

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
            onChange={(petId) => handlePetSelect(petId)}
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

      <CardList key={activeTab} className="fade-in">
        {pageLoading && medicineNoti.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : error ? (
          <SectionError
            message="Failed to load medication reminders"
            onRetry={() => {
              const token = authStorage.getToken() || '';
              const date = baseDate.toISOString().split('T')[0];
              fetchMedicineNotiData(token, selectedPetId, date);
            }}
          />
        ) : groupedMedicines.length > 0 ? (
          groupedMedicines.map((med) => (
            <MedicineCard
              key={`${med.medicine_id}_${med.pet_id}`}
              data={{
                // Adapter to make it look like NotificationItem for the card props if needed,
                // OR update MedicineCard to take GroupedMedicineNotification.
                // MedicineCard props: data: NotificationItem. 
                // Let's create a fake NotificationItem structure from med
                notification_id: med.reminders[0]?.notification_id || -1, // Use first noti id as base
                medicine_id: med.medicine_id,
                pet_id: med.pet_id,
                pet_name: med.pet_name,
                pet_image: med.pet_image,
                medicine_name: med.medicine_name,
                dosage: med.dosage,
                reminder_time: med.reminders.map(r => r.time),
                istaken: med.reminders.every(r => r.status === 'taken'), // Aggregate status
              }}
              groupedTimes={med.reminders.map(r => ({
                id: r.notification_id,
                timeLabel: r.time, // API returns HH:MM
                status: getMedicationStatus(r.time, r.status === 'taken', baseDate)
              }))}
              onOpenDetail={() => {
                // Use first reminder ID for detail
                const firstId = med.reminders[0]?.notification_id;
                if (firstId) handleReminderClick(firstId, med.medicine_id);
              }}
              onToggleTaken={(reminderId: string | number) =>
                handleToggleReminder(Number(reminderId))
              }
              onEdit={() => {
                const firstId = med.reminders[0]?.notification_id;
                if (firstId) handleEditFromCard(firstId, med.medicine_id);
              }}
              onDelete={() => handleDelete(med.reminders[0]?.notification_id?.toString() || '', med.medicine_id.toString())}
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
        onClose={closePopup}
        onSuccess={() => { closePopup(); fetchMedicineNotiData(authStorage.getToken() || '', selectedPetId, baseDate.toISOString().split('T')[0]); }}
        pets={pets}
      />

      {selectedReminder && (
        <MedicationDetailPopup
          page="medication-page"
          medicineReminder={selectedReminder.medicineReminder}
          occurrences={
            // Find the grouped medicine to pass its reminders list
            groupedMedicines.find(
              gm => gm.medicine_id === selectedReminder.medicineReminder.medicine_id &&
                gm.pet_id === selectedReminder.medicineReminder.pet_id
            )?.reminders || []
          }
          highlightedReminderId={selectedReminder.highlightedReminderId}
          onClose={closePopup}
          onToggleReminder={(reminderId: number) =>
            handleToggleReminder(reminderId)
          }
          onEdit={handleEditFromDetail}
        />
      )}

      {editingReminder && (
        <EditMedicationPopup
          open={!!editingReminder}
          onClose={closePopup}
          medicineReminder={editingReminder}
          pets={pets}
          onSuccess={() => { closePopup(); fetchMedicineNotiData(authStorage.getToken() || '', selectedPetId, baseDate.toISOString().split('T')[0]); }}
        />
      )}
    </Page>
  );
}
