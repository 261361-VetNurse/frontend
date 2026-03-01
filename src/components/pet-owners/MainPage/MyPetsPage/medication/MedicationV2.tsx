"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from '@/hooks/use-next-routing';
import TopBar from "@/components/pet-owners/layout/TopBar";
import PetFilterSelector from '@/components/pet-owners/shared/PetFilterSelector';
import CreateMedicationPopup from '../../MedicationPage/AddMedicationPopup';
import EditMedicationPopup from '../../MedicationPage/EditMedicationPopup';
import MedicineCard from '../../MedicationPage/MedicineCard';
import Image from '@/components/shared/Image';
import { Medicine } from '@/types/domain/medication';

import { authStorage, getMedicinesByPet, deleteMedicine } from '@/services/api/client';
import { usePets } from '@/hooks';
import { CardList } from "@/styles/components/medication.styled";
import { QuickDialButton } from '@/components/shared';
// Types


export default function MedicationPageV2() {
  const router = useRouter();
  const { pet_id } = useParams<{ pet_id: string }>();

  const [medicineReminders, setMedicineReminders] = useState<Medicine[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);

  // Fetch pets - Use API hook
  const { pets: apiPets, loading: petsLoading } = usePets();

  // Selected Pet Logic
  const [selectedPetId, setSelectedPetId] = useState<number>(pet_id ? Number(pet_id) : 0);

  // Sync state with URL param
  useEffect(() => {
    if (pet_id) {
      setSelectedPetId(Number(pet_id));
    } else if (apiPets.length > 0 && !selectedPetId) {
      // If no petId in URL but we have pets, default to first or stay empty?
      // MyPetsPage usually requires a pet context, but let's handle if URL changes.
      // Actually, normally MyPetsPage requires selection.
    }
  }, [pet_id, apiPets, selectedPetId]);


  const selectedPet = useMemo(() => {
    // If selectedPetId matches a pet, use it
    return apiPets.find(p => p.pet_id === selectedPetId);
  }, [apiPets, selectedPetId]);


  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Medicine | null>(null);

  const fetchReminders = useCallback(async () => {
    if (!selectedPetId) return;

    try {
      const token = authStorage.getToken();
      if (!token) return;
      setRemindersLoading(true);

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = (await getMedicinesByPet(token, selectedPetId.toString())) as any[];

        const mappedData: Medicine[] = data.map((item) => ({
          medicine_id: item.medicine_id,
          pet_id: item.pet_id,
          name: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          reminder_time: item.reminder_time || [],
          start_date: item.start_date,
          end_date: item.end_date,
          status: item.status === 'TAKE' ? 'active' : 'stopped',
          properties: item.properties,
          image_urls: item.image_urls,
          notes: item.notes
        }));

        setMedicineReminders(mappedData);
      } catch (apiErr: unknown) {
        console.error('API failed:', apiErr);
      }
    } catch (err) {
      console.error('Error fetching medicine reminders:', err);
    } finally {
      setRemindersLoading(false);
    }
  }, [selectedPetId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);



  // Handlers
  const handlePetSelect = (id: number | null) => {
    setSelectedPetId(id || 0);
    router.push(`/pet-owners/my-pets-page/${id}/medications`);
  };

  const handleAdd = () => setShowCreatePopup(true);
  const handleCloseCreatePopup = () => setShowCreatePopup(false);

  const handleSubmitCreatePopup = () => {
    setShowCreatePopup(false);
    fetchReminders();
  };



  const handleDeleteFromCard = async (planId: string) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        const token = authStorage.getToken();
        if (token) {
          const reminder = medicineReminders.find(mr => mr.medicine_id === Number(planId));
          if (reminder) {
            await deleteMedicine(token, reminder.medicine_id.toString());
            setMedicineReminders(prev => prev.filter(mr => mr.medicine_id !== reminder.medicine_id));
          }
        }
      } catch (err: unknown) {
        alert("Failed to delete medication");
        console.error(err);
      }
    }
  };



  const handleSaveEdit = () => {
    setEditingReminder(null);
    fetchReminders();
  };



  const loading = remindersLoading || petsLoading;


  return (
    <div className="flex flex-col gap-4">
      <TopBar
        title="Medication"
        onBack={() => router.push(`/pet-owners/my-pets-page/${selectedPet?.pet_id}`)}
      />

      <PetFilterSelector
        mode="filter"
        allowAllPets={false}
        pets={apiPets}
        value={selectedPetId}
        onChange={(petId) => handlePetSelect(petId)}
      />

      <div className="flex items-center justify-center px-4 py-2 gap-3">
        <div className="h-[1px] flex-1 bg-zinc-300"></div>
        <div className="text-sm font-medium text-zinc-500">All Medication</div>
        <div className="h-[1px] flex-1 bg-zinc-300"></div>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
        ) : medicineReminders.length > 0 ? (
          <CardList>
            {medicineReminders.map((med) => (
              <MedicineCard
                key={med.medicine_id}
                data={{
                  notification_id: med.medicine_id, // Use medicine_id as fallback
                  medicine_id: med.medicine_id,
                  pet_id: med.pet_id,
                  pet_name: selectedPet?.name || '',
                  pet_image: selectedPet?.profile_image || '',
                  medicine_name: med.name,
                  dosage: med.dosage,
                  reminder_time: med.reminder_time,
                  istaken: false, // Not relevant for general list
                }}
                groupedTimes={med.reminder_time.map((time, index) => ({
                  id: index, // continuous index as id
                  timeLabel: time,
                  status: 'pending' // Placeholder
                }))}
                onOpenDetail={() => {
                  // We can still open detail, but might need adjustment if it expects occurrences
                  // For now, passing the med as is
                  setEditingReminder(med);
                }}
                onToggleTaken={() => { }} // Disable for general list
                onEdit={() => setEditingReminder(med)}
                onDelete={() => handleDeleteFromCard(String(med.medicine_id))}
              />
            ))}
          </CardList>
        ) : (
          <div style={{ fontSize: 14, color: "#71717a", textAlign: 'center', padding: '32px' }}>
            No medications found.
          </div>
        )}
      </div>

      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<Image src="/add-new.svg" alt="add" width={24} height={24} style={{ filter: 'brightness(0) invert(1)' }} />}
        color="#09BFF8"
        onClickAction={handleAdd}
      />

      <CreateMedicationPopup
        open={showCreatePopup}
        onClose={handleCloseCreatePopup}
        onSuccess={handleSubmitCreatePopup}
        pets={apiPets}
        initialPetId={selectedPetId}
      />



      {editingReminder && (
        <EditMedicationPopup
          open={!!editingReminder}
          onClose={() => setEditingReminder(null)}
          medicineReminder={editingReminder}
          pets={apiPets}
          onSuccess={handleSaveEdit}
        />
      )}
    </div>
  );
}