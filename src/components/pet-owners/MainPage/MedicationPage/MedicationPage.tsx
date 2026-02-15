'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Medicine, NotificationDetail, NotificationItem } from '@/types/domain/medication';
import MedicineCard from './MedicineCard';
import CreateMedicationPopup from './AddMedicationPopup';
import EditMedicationPopup from './EditMedicationPopup';
import MedicationDetailPopup from './MedicationDetailPopup';
import SectionError from "@/components/pet-owners/shared/SectionError";

// Hooks
import { usePets } from '@/hooks';

// API
import {
  authStorage,
  getMedications,
  getMedicationNotificationDetail,
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
  const [medicineNoti, setMedicinesNoti] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
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
    medicineReminder: any; // Medicine or detailed object
    highlightedReminderId?: number;
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

  // Memoize baseDate to prevent infinite loop - only recalculate when activeTab changes
  const baseDate = useMemo(() => getDateForTab(activeTab), [activeTab]);

  const fetchMedicineNotiData = async (token: string, petId: number, date: string) => {
    try {
      setError(null);
      const data = await getMedications(token, petId, date);
      setMedicinesNoti(data);
    } catch (error) {
      console.error('Error fetching medicine notifications:', error);
      setError('Failed to load medication reminders');
    }
  };

  // Deep link handling
  useEffect(() => {
    const notificationId = Number(searchParams.get('noti_id'));
    const medicineId = Number(searchParams.get('med_id'));
    const openMode = searchParams.get('open');

    const handleDeepLink = async () => {
      if (!notificationId || !medicineId) return;
      try {
        const token = authStorage.getToken() || "";
        const detail = await getMedicationNotificationDetail(token, notificationId);
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

  // Fetch medication data when tab, pet, or date changes
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    const date = baseDate.toISOString().split('T')[0];
    fetchMedicineNotiData(token, selectedPetId, date);
  }, [selectedPetId, baseDate]);

  // Client-side filtering as a safety measure
  const filteredMedicines = useMemo(() => {
    if (selectedPetId === 0) return medicineNoti;
    return medicineNoti.filter(m => m.pet_id === selectedPetId);
  }, [medicineNoti, selectedPetId]);


  const handlePetSelect = (petId: number | null) => {
    setSelectedPetId(petId || 0);
    const params = new URLSearchParams(searchParams.toString());
    if (petId === 0) {
      params.delete('pet_id');
    } else {
      params.set('pet_id', petId?.toString() || '');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAdd = () => {
    setShowCreatePopup(true);
  };

  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
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
      params.set('noti_id', notiId.toString());
      params.set('med_id', medId.toString());
      router.push(`?${params.toString()}`, { scroll: false });

    } catch (e) {
      console.error("Failed to load detail", e);
    }
  };

  const handleEditFromCard = async (medId: number) => {
    try {
      const token = authStorage.getToken() || "";
      const detail = await getMedicationNotificationDetail(token, medId);
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

      <CardList>
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
        ) : filteredMedicines.length > 0 ? (
          filteredMedicines.map((med) => (
            <MedicineCard
              key={`${med.notification_id}_${med.medicine_id}`}
              data={med}
              onOpenDetail={() => handleReminderClick(med.notification_id, med.medicine_id)}
              onToggleTaken={() =>
                handleToggleReminder(med.notification_id)
              }
              onEdit={() => handleEditFromCard(med.medicine_id)}
              onDelete={() => handleDelete(med.notification_id.toString(), med.medicine_id.toString())}
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
        onSuccess={() => { setShowCreatePopup(false); fetchMedicineNotiData(authStorage.getToken() || '', selectedPetId, baseDate.toISOString().split('T')[0]); }}
        pets={pets}
      />

      {selectedReminder && (
        <MedicationDetailPopup
          page="medication-page"
          medicineReminder={selectedReminder.medicineReminder}
          highlightedReminderId={selectedReminder.highlightedReminderId}
          onClose={handleCloseDetail}
          onToggleReminder={(reminderId: number) =>
            handleToggleReminder(reminderId)
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
          onSuccess={() => { setEditingReminder(null); fetchMedicineNotiData(authStorage.getToken() || '', selectedPetId, baseDate.toISOString().split('T')[0]); }}
        />
      )}
    </Page>
  );
}
