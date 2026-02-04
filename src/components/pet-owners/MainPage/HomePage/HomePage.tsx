"use client";

import { useState, useEffect } from "react";
import { HomePageStyled } from "@/styles/components/homepage.styled";
import AppointmentCard from "./AppointmentCard";
import { useRouter } from "next/navigation";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import Profile from "@/components/pet-owners/shared/Profile";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { theme } from "@/styles/tokens/theme";
import {
  formatTimeForDisplay,
} from "@/utils/reminder-utils";
import ReminderCard from "./ReminderCard";
import { DashboardData } from "@/types/domain/dashboard";
import { Appointment } from "@/types/domain/appointment";
import MedicationDetailPopup from "./MedicationDetailPopup";
import AppointmentDetailPopup from "./AppointmentDetailPopup";
import { getDashboardHome, authStorage, getMedicineDetail, markMedicationTaken } from "@/services/api/client";
import { Medicine, MedicineNotification } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  /* New State for Popup */
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [selectedPet, setSelectedPet] = useState<{ _id: string, name: string, profile_image: string } | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<MedicineNotification | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = authStorage.getToken() || "";
        const response = await getDashboardHome(token);
        if (response.success) {
          setData(response.data);
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

  const { fname, profile_image,  pets, medicines_notifications, appointments } = data;

  /* Handler: Click on Reminder Card -> Fetch Detail & Open Popup */
  /* Handler: Click on Reminder Card -> Fetch Detail & Open Popup */
  const handleReminderClick = async (notif: MedicineNotification) => {
    try {
      setPopupLoading(true);

      const token = authStorage.getToken() || "";
      // We need to get Medicine Detail. 
      // Assuming getMedicineDetail(token, notif._id, notif.medicine_id) works or we can mock it.
      // Since client.ts exports getMedicineDetail taking (token, notificationId, medicineId)...
      const medicine = await getMedicineDetail(token, notif._id, notif.medicine_id);

      // Find Pet Info from local dashboard data
      const petInfo = pets.find(p => p.pet_id === notif.pet_id);

      if (medicine && petInfo) {
        setSelectedMedicine(medicine);
        // Map DashboardPet to object compatible with Pet type for Popup (need basic fields)
        setSelectedPet({
          _id: petInfo.pet_id,
          name: petInfo.name,
          profile_image: petInfo.profile_image
        });

        setSelectedNotification(notif);

      } else {
        alert("Medication details not found.");
      }
    } catch (err) {
      console.error("Failed to load medication detail:", err);
      // alert("Failed to load medication details."); 
    } finally {
      setPopupLoading(false);
    }
  };

  /* Handler: Toggle Reminder Status in Popup */
  const handleToggleReminder = async (reminderId: string, isTaken: boolean) => {
    // 1. Optimistic Update (Popup)
    // Update the selected notification locally
    if (selectedNotification && selectedNotification._id === reminderId) {
      setSelectedNotification({ ...selectedNotification, istaken: isTaken, status: isTaken ? 'taken' : 'pending', updated_at: new Date().toISOString() });
    }

    // 2. Update dashboard data to reflect changes
    if (data) {
      const updatedNotifications = data.medicines_notifications.map(notif =>
        notif._id === reminderId
          ? { ...notif, istaken: isTaken, status: isTaken ? 'taken' : 'pending' }
          : notif
      );
      setData({ ...data, medicines_notifications: updatedNotifications });
    }

    // 3. API Call (Fail gracefully for offline/mock support)
    try {
      if (reminderId) {
        const token = authStorage.getToken() || "";
        await markMedicationTaken(token, reminderId, isTaken);
        console.log(`[API] Medication ${reminderId} marked as ${isTaken ? 'taken' : 'pending'}`);
      }
    } catch (err) {
      console.warn("[API] Failed to update medication status, keeping optimistic update:", err);
    }
  };

  const handleClosePopup = () => {
    setSelectedMedicine(null);
    setSelectedPet(null);
    setSelectedNotification(null);
  };


  return (
    <HomePageStyled>
      <div className="header-box">
        <Profile
          imageUrl={profile_image}
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
          medicines_notifications.map((med_noti) => {
            // Parse time from notification_at ISO and format it
            const dateObj = new Date(med_noti.notification_at);
            const hours = dateObj.getHours().toString().padStart(2, '0');
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hours}:${minutes}`;

            return (
              <div key={med_noti._id}>
                <ReminderCard
                  datas={med_noti}
                  petImageSize={40}
                  onClick={() => handleReminderClick(med_noti)}
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
      {selectedMedicine && selectedPet && selectedNotification && (
        <MedicationDetailPopup
          page="home-page"
          medicine={selectedMedicine}
          notification={selectedNotification}
          pet={selectedPet as any}
          onClose={handleClosePopup}
          onToggleReminder={handleToggleReminder}
          onEdit={() => {
            // Optional: Handle edit if needed
            router.push(`/pet-owners/medication-page?notification_id=${selectedNotification._id}&open=edit`);
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

      {/* <div className="appoint-box">
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

            return (
              <AppointmentCard
                key={apt._id}
                datas={apt}
                petImageSize={40}
                onClick={() => setSelectedAppointment(apt)}
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
      </div> */}

      {/* Appointment Detail Popup */}
      {/* {selectedAppointment && (
        <AppointmentDetailPopup
          appointment={selectedAppointment}
          petImageUrl={appointments.find(a => a._id === selectedAppointment.id)?.pet_image}
          onClose={() => setSelectedAppointment(null)}
          onEdit={() => {
            router.push(`/pet-owners/calendar-page?tab=appointment&appointment_id=${selectedAppointment.id}&open=edit`);
          }}
        />
      )} */}
    </HomePageStyled>
  );
}