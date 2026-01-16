"use client";

import { useState, useMemo } from "react";
import { HomePageStyled } from "@/styles/homepage.styled";
import AppointmentCard from "./AppointmentCard";
import { mockAppointments } from "@/mocks/appointments";
import { useRouter } from "next/navigation";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import Profile from "@/components/pet-owners/shared/Profile";
import { mockPets } from "@/mocks/pets.mock";
import { Pet } from "@/types/pet";
import { mockMedicineReminderVMs } from "@/mocks/medicine-reminders.mock";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { theme } from "@/styles/theme";
import { MedicineReminderVM } from "@/types/medicine-reminder";
import {
  getHomePageReminders,
  formatTimeForDisplay,
  updateReminderTakenStatus,
  ReminderOccurrence,
} from "@/lib/reminder-utils";
import MedicationDetailPopup from "../HomePage/MedicationDetailPopup";
import ReminderCard from "./ReminderCard";

export default function HomePage({ username }: { username: string }) {
  const router = useRouter();

  const [medicineReminders, setMedicineReminders] =
    useState<MedicineReminderVM[]>(mockMedicineReminderVMs);

  const [selectedReminder, setSelectedReminder] = useState<{
    medicineReminder: MedicineReminderVM;
    highlightedReminderId: string;
    page: 'home-page' | 'medication-page';
  } | null>(null);

  // Get filtered reminders for home page display
  const homeReminders = useMemo(
    () => getHomePageReminders(medicineReminders),
    [medicineReminders]
  );

  const displayReminders = homeReminders.slice(0, 5);
  const hasMoreReminders = homeReminders.length > 5;

  const handleReminderClick = (occ: ReminderOccurrence) => {
    // NEW: occ.plan_id is the plan notification_id
    const plan = medicineReminders.find(
      (mr) => mr.notification_id === occ.plan_id
    );

    if (!plan) return;

    setSelectedReminder({
      medicineReminder: plan,
      highlightedReminderId: occ.reminder_id,
      page: 'home-page',
    });
  };

  const handleToggleReminder = (reminderId: string, isTaken: boolean) => {
    if (!selectedReminder) return;

    const planId = selectedReminder.medicineReminder.notification_id;

    const updated = updateReminderTakenStatus(
      medicineReminders,
      planId,
      reminderId,
      isTaken
    );

    setMedicineReminders(updated);

    // sync selectedReminder plan snapshot
    const updatedPlan = updated.find((mr) => mr.notification_id === planId);
    if (updatedPlan) {
      setSelectedReminder((prev) =>
        prev ? { ...prev, medicineReminder: updatedPlan } : prev
      );
    }
  };

  const handleEditMedication = () => {
    if (!selectedReminder) return;

    const planId = selectedReminder.medicineReminder.notification_id;
    const reminderId = selectedReminder.highlightedReminderId;

    setSelectedReminder(null);

    // If you want to open EDIT mode directly, add open=edit
    router.push(
      `/pet-owners/medication-page?notification_id=${planId}&reminder_id=${reminderId}&open=edit`
    );
  };

  const handleClosePopup = () => {
    setSelectedReminder(null);
  };

  return (
    <HomePageStyled>
      <div className="header-box">
        <Profile
          imageUrl={"/images/profile-test.png"}
          size={50}
          href={"/pet-owners/owner-info-page"}
        />
        <span>Hi! {username}</span>
        <HelpOutlineIcon
          sx={{
            ml: "auto",
            fontSize: 22,
            color: theme.colors.textSecondary,
            cursor: "pointer",
          }}
          onClick={() => router.push("/pet-owners/help-center-page")}
        />
      </div>

      <div className="head-section">
        <div className="head-right">My Pets</div>
        <div
          className="head-left"
          onClick={() => router.push("/pet-owners/my-pets-page")}
        >
          <div className="sub">show all</div>
          <ArrowForwardIosIcon
            sx={{
              ml: "auto",
              fontSize: 16,
              color: theme.colors.textSecondary,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div className="mypet-section">
        <div className="pet-list">
          {mockPets.map((pet: Pet, index: number) => (
            <Profile
              key={index}
              imageUrl={pet.profile_image}
              size={60}
              label={pet.name}
              showLabel={true}
            />
          ))}
        </div>
        <NewPetButton />
      </div>

      <div className="head-section">
        <div className="head-right">Reminder</div>
        <div
          className="head-left"
          onClick={() => router.push("/pet-owners/medication-page")}
        >
          <div className="sub">show all</div>
          <ArrowForwardIosIcon
            sx={{
              ml: "auto",
              fontSize: 16,
              color: theme.colors.textSecondary,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div className="reminder-box">
        {displayReminders.length > 0 ? (
          displayReminders.map((occ) => (
            <div key={occ.occurrence_id}>
              <ReminderCard
                page="home-page"
                petImageUrl={occ.pet.image_url}
                medicineName={occ.medicine.name}
                dosage={occ.medicine.dosage}
                schedule={{ frequency_label: occ.frequency_label, time: formatTimeForDisplay(occ.time) }}
                status={occ.status}
                onClick={() => handleReminderClick(occ)}
              />
            </div>
          ))
        ) : (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            No upcoming medication reminders in the next 2 hours.
          </div>
        )}

        {hasMoreReminders && (
          <div
            style={{
              padding: "16px",
              textAlign: "center",
              color: theme.colors.primary,
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
            onClick={() => router.push("/pet-owners/medication-page")}
          >
            View all today ({homeReminders.length} reminders)
          </div>
        )}
      </div>

      <div className="head-section">
        <div className="head-right">Upcoming appointments</div>
        <div
          className="head-left"
          onClick={() => router.push("/pet-owners/calendar-page?tab=appointment")}
        >
          <div className="sub">show all</div>
          <ArrowForwardIosIcon
            sx={{
              ml: "auto",
              fontSize: 16,
              color: theme.colors.textSecondary,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div className="appoint-box">
        {mockAppointments.slice(0, 3).map((apt) => (
          <AppointmentCard key={apt.id} appointment={apt} />
        ))}
      </div>

      {selectedReminder && (
        <MedicationDetailPopup
          page={selectedReminder.page}
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