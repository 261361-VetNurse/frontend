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
import ReminderCard from "./ReminderCard";
import { DashboardData, DashboardMedicineDetail } from "@/types/domain/dashboard";
import { Appointment } from "@/types/domain/appointment";
import MedicationDetailPopup from "./MedicationDetailPopup";
import AppointmentDetailPopup from "./AppointmentDetailPopup";
import { getDashboardHome, authStorage, getMedicineDetail, markMedicationTaken, getMedicationNotificationDetail } from "@/services/api/client";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  /* New State for Popup */
  const [selectedNotification, setSelectedNotification] = useState<DashboardMedicineDetail | null>(null);
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

  /* Handler: Click on Reminder Card -> Fetch Detail & Open Popup */
  const handleReminderClick = async (noti: string) => {
    try {
      setPopupLoading(true);
      const token = authStorage.getToken() || "";
      const notiDetail = await getMedicationNotificationDetail(token, noti);
      setSelectedNotification(notiDetail);
    } catch (err) {
      console.error("Failed to load medication detail:", err);
    } finally {
      setPopupLoading(false);
    }
  };

  /* Handler: Toggle Reminder Status in Popup */
  const handleToggleReminder = async (reminderId: string, isTaken: boolean) => {
    // API Call Only (Pessimistic Update)
    try {
      if (reminderId) {
        const token = authStorage.getToken() || "";
        // 1. Send API Request
        await markMedicationTaken(token, reminderId, isTaken);
        console.log(`[API] Medication ${reminderId} marked as ${isTaken ? 'taken' : 'pending'}`);

        // 2. Update local state ONLY after successful API response
        if (selectedNotification && selectedNotification._id === reminderId) {
          setSelectedNotification({ ...selectedNotification, istaken: isTaken, status: isTaken ? 'taken' : 'pending' });
        }

        if (data) {
          const updatedNotifications = data.medicines_notifications.map(noti =>
            noti._id === reminderId
              ? { ...noti, istaken: isTaken, status: isTaken ? 'taken' : 'pending' }
              : noti
          );
          setData({ ...data, medicines_notifications: updatedNotifications });
        }
      }
    } catch (err) {
      console.warn("[API] Failed to update medication status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const handleClosePopup = () => {
    setSelectedNotification(null);
    setSelectedAppointment(null);
  };

  return (
    <HomePageStyled>
      <div className="header-box">
        <Profile
          imageUrl={data.profile_image}
          size={50}
          href={"/pet-owners/owner-info-page"}
        />
        <span>Hi! {data.fname}</span>
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
          {data.pets.map((pet) => (
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
        {data.medicines_notifications.length > 0 ? (
          data.medicines_notifications.map((med_noti) => {
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
                  onClick={() => handleReminderClick(med_noti._id)}
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
      {selectedNotification && (
        <MedicationDetailPopup
          page="home-page"
          noti={selectedNotification}
          onClose={handleClosePopup}
          onToggleReminder={handleToggleReminder}
          onEdit={() => {
            // Optional: Handle edit if needed
            router.push(`/pet-owners/medication-page?noti_id=${selectedNotification._id}&med_id=${selectedNotification.medicine_id}&open=edit`);
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