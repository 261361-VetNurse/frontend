"use client";

import { useState, useEffect } from "react";
import { HomePageStyled } from "@/styles/homepage.styled";
import AppointmentCard from "./AppointmentCard";
import { useRouter } from "next/navigation";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import Profile from "@/components/pet-owners/shared/Profile";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { theme } from "@/styles/theme";
import {
  formatTimeForDisplay,
} from "@/lib/reminder-utils";
import ReminderCard from "./ReminderCard";
import { DashboardData, DashboardNotification } from "@/types/dashboard";
import { Appointment } from "@/types/Appointment";
import { MedicineReminderVM } from "@/types/medicine-reminder";
import MedicationDetailPopup from "./MedicationDetailPopup";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  /* New State for Popup */
  const [selectedReminder, setSelectedReminder] = useState<MedicineReminderVM | null>(null);
  const [highlightedReminderId, setHighlightedReminderId] = useState<string | undefined>(undefined);
  const [popupLoading, setPopupLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Use mock data instead of API call
        const { mockDashboardData } = await import('@/mocks/dashboard.mock');
        if (mockDashboardData.success) {
          setData(mockDashboardData.data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, textAlign: "center", color: "red" }}>{error}</div>;
  if (!data) return null;

  const { fname, pets, medicines_notifications, appointments } = data;

  /* Handler: Click on Reminder Card -> Fetch Detail & Open Popup */
  const handleReminderClick = async (notif: DashboardNotification) => {
    try {
      setPopupLoading(true);

      // Use mock data instead of API call
      const { getMockMedicationDetail } = await import('@/mocks/dashboard.mock');
      const detail = getMockMedicationDetail(notif._id);

      if (detail) {
        setSelectedReminder(detail);
        setHighlightedReminderId(notif._id);
      } else {
        alert("Medication details not found.");
      }
    } catch (err) {
      console.error("Failed to load medication detail:", err);
      alert("Failed to load medication details.");
    } finally {
      setPopupLoading(false);
    }
  };

  /* Handler: Toggle Reminder Status in Popup */
  const handleToggleReminder = async (reminderId: string, isTaken: boolean) => {
    // 1. Optimistic Update (Popup)
    if (selectedReminder) {
      const updatedSchedule = { ...selectedReminder.schedule };
      updatedSchedule.reminders = updatedSchedule.reminders.map(r =>
        r.id === reminderId ? { ...r, is_taken: isTaken, status: isTaken ? 'taken' : 'pending' } : r
      );
      setSelectedReminder({ ...selectedReminder, schedule: updatedSchedule });
    }

    // 2. Update local state (no API call)
    console.log(`[MOCK] Medication ${reminderId} marked as ${isTaken ? 'taken' : 'not taken'}`);

    // 3. Update dashboard data to reflect changes
    if (data) {
      const updatedNotifications = data.medicines_notifications.map(notif =>
        notif._id === highlightedReminderId
          ? { ...notif, istaken: isTaken, status: isTaken ? 'taken' : 'pending' }
          : notif
      );
      setData({ ...data, medicines_notifications: updatedNotifications });
    }
  };

  const handleClosePopup = () => {
    setSelectedReminder(null);
    setHighlightedReminderId(undefined);
  };


  return (
    <HomePageStyled>
      <div className="header-box">
        <Profile
          imageUrl={"/images/profile-test.png"}
          size={50}
          href={"/pet-owners/owner-info-page"}
        />
        <span>Hi! {fname}</span>
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
          {pets.map((pet) => (
            <Profile
              key={pet.pet_id}
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
        {medicines_notifications.length > 0 ? (
          medicines_notifications.map((notif) => {
            // Parse time from notification_at ISO and format it
            const dateObj = new Date(notif.notification_at);
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            return (
              <div key={notif._id}>
                <ReminderCard
                  petImageUrl={notif.pet_image || "/pets-example/pet-ex1.svg"}
                  medicineName={notif.medicine_name}
                  dosage={undefined} // API doesn't provide dosage - let component handle display
                  schedule={{
                    frequency_label: "Daily", // TODO: API should provide frequency_label
                    time: formatTimeForDisplay(timeStr)
                  }}
                  status={notif.status}
                  onClick={() => handleReminderClick(notif)}
                />
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            No upcoming medication reminders.
          </div>
        )}
      </div>

      {/* Medication Detail Popup */}
      {selectedReminder && (
        <MedicationDetailPopup
          page="home-page"
          medicineReminder={selectedReminder}
          highlightedReminderId={highlightedReminderId}
          onClose={handleClosePopup}
          onToggleReminder={handleToggleReminder}
          onEdit={() => {
            // Optional: Handle edit if needed, or just redirect to medication page for edit
            router.push(`/pet-owners/medication-page?notification_id=${selectedReminder.notification_id}&open=edit`);
          }}
        />
      )}

      {/* Loading Overlay for Popup */}
      {popupLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          Loading...
        </div>
      )}

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
        {appointments.length > 0 ? (
          appointments.slice(0, 3).map((apt) => {
            // Parse appointment date
            const appointmentDate = new Date(apt.appointment_date);

            // Format date as "DD MMM YYYY" (e.g., "17 Jan 2026")
            const formattedDate = appointmentDate.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });

            // Format time as "HH:mm" (e.g., "14:30")
            const formattedTime = appointmentDate.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });

            // Map to Appointment type expected by card
            const appointment: Appointment = {
              id: apt._id,
              petId: apt.pet_id,
              petName: apt.pet_name,
              date: formattedDate,
              time: formattedTime,
              location: "Veterinary Clinic", // TODO: API should provide location
              status: apt.status as any
            };

            return (
              <AppointmentCard
                key={apt._id}
                appointment={appointment}
                petImageUrl={apt.pet_image || "/pets-example/pet-ex1.svg"}
              />
            );
          })
        ) : (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: theme.colors.textSecondary,
              fontSize: "14px",
            }}
          >
            No upcoming appointments.
          </div>
        )}
      </div>
    </HomePageStyled>
  );
}