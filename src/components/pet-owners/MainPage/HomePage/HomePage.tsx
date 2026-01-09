"use client";

import { useState } from "react";
import { HomePageStyled } from "@/styles/homepage.styled";
import ReminderBox from "./ReminderBox";
import AppointmentBox from "./AppointBox";
import { useRouter } from "next/dist/client/components/navigation";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import Profile from "@/components/pet-owners/shared/Profile";
import { mockPets } from "@/mocks/pets.mock"
import { Pet } from "@/types/pet";
import { mockMedicineReminderVMs } from "@/mocks/medicine-reminders.mock";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { theme } from "@/styles/theme";
import { MedicineReminderVM } from "@/types/medicine-reminder";
import { 
  getHomePageReminders, 
  formatTimeForDisplay,
  updateReminderTakenStatus,
  ReminderOccurrence 
} from "@/lib/reminder-utils";
import MedicationDetailPopup from "../MedicationPage/MedicationDetailPopup";

export default function HomePage({username}: {username: string}) {
    const router = useRouter();
    const [medicineReminders, setMedicineReminders] = useState<MedicineReminderVM[]>(mockMedicineReminderVMs);
    const [selectedReminder, setSelectedReminder] = useState<{
      medicineReminder: MedicineReminderVM;
      highlightedReminderId: string;
    } | null>(null);

    // Get filtered reminders for home page display
    const homeReminders = getHomePageReminders(medicineReminders);
    const displayReminders = homeReminders.slice(0, 5); // Limit to 5 cards
    const hasMoreReminders = homeReminders.length > 5;

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

    const handleToggleReminder = (reminderId: string, isTaken: boolean) => {
      if (!selectedReminder) return;
      
      const updatedReminders = updateReminderTakenStatus(
        medicineReminders,
        selectedReminder.medicineReminder.notification_id,
        reminderId,
        isTaken
      );
      
      setMedicineReminders(updatedReminders);
      
      // Update the selected reminder state
      const updatedMedicineReminder = updatedReminders.find(
        mr => mr.notification_id === selectedReminder.medicineReminder.notification_id
      );
      
      if (updatedMedicineReminder) {
        setSelectedReminder({
          ...selectedReminder,
          medicineReminder: updatedMedicineReminder,
        });
      }
    };

    const handleEditMedication = () => {
      if (!selectedReminder) return;
      
      setSelectedReminder(null);
      router.push(
        `/pet-owners/medication-page?notification_id=${selectedReminder.medicineReminder.notification_id}&reminder_id=${selectedReminder.highlightedReminderId}`
      );
    };

    const handleClosePopup = () => {
      setSelectedReminder(null);
    };

    return(
        <HomePageStyled>
            <div className="header-box">
                <Profile imageUrl={'/images/profile-test.png'} size={50} href={'/pet-owners/owner-info-page'} />
                <span>Hi! {username}</span>
                <HelpOutlineIcon
                    sx={{
                        ml: 'auto',
                        fontSize: 22,
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                    }}
                    onClick={() => router.push('/pet-owners/help-center-page')}
                />
            </div>
            <div className="head-section">
                <div className="head-right">My Pets</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/my-pets-page')}>
                        <div className="sub">show all</div>
                        <ArrowForwardIosIcon
                            sx={{
                                ml: 'auto',
                                fontSize: 16,
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push('/pet-owners/help-center-page')}
                        />
                </div>
            </div>
            <div className="mypet-section">
                <div className="pet-list">
                    {mockPets.map((pet:Pet,index: number) => (
                        <Profile key={index} imageUrl={pet.image_url} size={60} label={pet.name} showLabel={true} />
                    ))}
                </div>
                <NewPetButton />
            </div>
            <div className="head-section">
                <div className="head-right">Reminder</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/medication-page')}>
                        <div className="sub">show all</div>
                        <ArrowForwardIosIcon
                            sx={{
                                ml: 'auto',
                                fontSize: 16,
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push('/pet-owners/help-center-page')}
                        />
                </div>
            </div>
            <div className="reminder-box">
                {displayReminders.length > 0 ? (
                  displayReminders.map((occurrence) => (
                    <div key={`${occurrence.notification_id}-${occurrence.reminder_id}`}>
                      <ReminderBox 
                        petName={occurrence.pet.name}
                        petImageUrl={occurrence.pet.image_url}
                        medicineName={occurrence.medicine.name}
                        dosage={occurrence.medicine.dosage}
                        timeLabel={formatTimeForDisplay(occurrence.time)}
                        is_taken={occurrence.is_taken}
                        onClick={() => handleReminderClick(occurrence)}
                      />
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    padding: '32px 16px', 
                    textAlign: 'center', 
                    color: theme.colors.textSecondary,
                    fontSize: '14px'
                  }}>
                    No upcoming medication reminders in the next 2 hours.
                  </div>
                )}
                
                {hasMoreReminders && (
                  <div 
                    style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      color: theme.colors.primary,
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push('/pet-owners/medication-page')}
                  >
                    View all today ({homeReminders.length} reminders)
                  </div>
                )}
            </div>
            <div className="head-section">
                <div className="head-right">Upcoming appointments</div>
                <div 
                    className="head-left"
                    onClick={() => router.push('/pet-owners/calendar-page?tab=appointment')}>
                        <div className="sub">show all</div>
                        <ArrowForwardIosIcon
                            sx={{
                                ml: 'auto',
                                fontSize: 16,
                                color: theme.colors.textSecondary,
                                cursor: 'pointer',
                            }}
                            onClick={() => router.push('/pet-owners/help-center-page')}
                        />
                </div>
            </div>
            <div className="appoint-box">
                <AppointmentBox/>
                <AppointmentBox/>
            </div>

            {selectedReminder && (
              <MedicationDetailPopup
                medicineReminder={selectedReminder.medicineReminder}
                highlightedReminderId={selectedReminder.highlightedReminderId}
                onClose={handleClosePopup}
                onToggleReminder={handleToggleReminder}
                onEdit={handleEditMedication}
              />
            )}
        </HomePageStyled>
    );
}