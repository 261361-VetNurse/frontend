"use client";

import React, { useState, useEffect } from "react";
import { HomePageStyled } from "@/styles/components/homepage.styled";
import AppointmentCard from "./AppointmentCard";
import { useRouter } from "next/navigation";
import NewPetButton from "@/components/pet-owners/shared/NewPet";
import Profile from "@/components/pet-owners/shared/Profile";
const HelpOutlineIcon = ({ sx, onClick }: { sx?: React.CSSProperties & { ml?: string; fontSize?: number; color?: string; cursor?: string }; onClick?: () => void }) => (
  <Image width={24} height={24} src="/help.svg" alt="help" onClick={onClick} style={{ width: sx?.fontSize || 22, height: sx?.fontSize || 22, cursor: sx?.cursor, marginLeft: sx?.ml }} />
);
const ArrowForwardIosIcon = ({ sx }: { sx?: React.CSSProperties & { ml?: string; fontSize?: number; color?: string; cursor?: string; transform?: string; transition?: string } }) => (
  <Image width={24} height={24} src="/next-icon.svg" alt="next" style={{ width: sx?.fontSize || 16, height: sx?.fontSize || 16, cursor: sx?.cursor, transform: sx?.transform, transition: sx?.transition }} />
);
import { theme } from "@/styles/tokens/theme";
import ReminderCard from "./ReminderCard";
import { DashboardData, DashboardNotification } from "@/types/domain/dashboard";
import { Appointment } from "@/types/domain/appointment";
import MedicationDetailPopup from "./MedicationDetailPopup";
import AppointmentDetailPopup from "./AppointmentDetailPopup";
import { getDashboardHome, authStorage, markMedicationTaken, getMedicationNotificationDetail, getAppointmentDetail } from "@/services/api/client";
import SectionError from "@/components/pet-owners/shared/SectionError";
import { getMedicationStatus } from "@/utils/medicationStatus";

import Image from 'next/image';
export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  /* New State for Popup */
  const [selectedNotification, setSelectedNotification] = useState<DashboardNotification | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [popupLoading, setPopupLoading] = useState(false);

  // Missing reminders state
  const [showMissingReminders, setShowMissingReminders] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Deep linking for Home Page
  useEffect(() => {
    // We use window.location.search to avoid router dependency loop, 
    // but we need to be careful about when this runs.
    const params = new URLSearchParams(window.location.search);
    const popupParam = params.get('popup');
    const notiId = Number(params.get('noti_id'));
    const appointmentId = Number(params.get('appointment_id'));

    const handleDeepLink = async () => {
      if (popupParam === 'view-medication' && notiId) {
        setPopupLoading(true);
        try {
          const token = authStorage.getToken() || "";
          const notiDetail = await getMedicationNotificationDetail(token, notiId);
          setSelectedNotification(notiDetail);
        } catch (e) {
          console.error(e);
          // If failed, maybe clear params?
        } finally { setPopupLoading(false); }
      } else if (popupParam === 'view-appointment' && appointmentId) {
        setPopupLoading(true);
        try {
          const token = authStorage.getToken() || "";
          const aptDetail = await getAppointmentDetail(token, appointmentId);
          setSelectedAppointment(aptDetail);
        } catch (e) { console.error(e); } finally { setPopupLoading(false); }
      }
    };

    // Only run if we actually have params to process
    if (popupParam) {
      handleDeepLink();
    }
  }, []);

  const openMedicationPopup = (noti: number) => {
    // Optimistic or just fetch? original logic fetches first.
    handleReminderClick(noti);
  };

  const openAppointmentPopup = (apt: number) => {
    handleAppointmentClick(apt);
  };

  const closePopup = () => {
    setSelectedNotification(null);
    setSelectedAppointment(null);

    // Clear params
    const params = new URLSearchParams(window.location.search);
    params.delete('popup');
    params.delete('noti_id');
    params.delete('appointment_id');

    // Use replace to avoid building up history
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const fetchDashboard = async () => {
    try {
      const token = authStorage.getToken();

      // If no token (and no code being processed), show loading then redirect or empty state
      if (!token) {
        // Optionally redirect to login if this page requires auth
        // router.push("/pet-owners/login-page");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const response = await getDashboardHome(token);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Removed blocking error return
  // if (error) return ...

  if (loading && !data && !error) return <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>;

  /* Handler: Click on Reminder Card -> Fetch Detail & Open Popup */
  const handleReminderClick = async (noti: number) => {
    try {
      setPopupLoading(true);
      const token = authStorage.getToken() || "";
      const notiDetail = await getMedicationNotificationDetail(token, noti);
      setSelectedNotification(notiDetail);

      const params = new URLSearchParams(window.location.search);
      params.set('popup', 'view-medication');
      params.set('noti_id', noti.toString());
      router.push(`?${params.toString()}`, { scroll: false });

    } catch (err) {
      console.error("Failed to load medication detail:", err);
      alert("Failed to load medication details.");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleAppointmentClick = async (apt: number) => {
    try {
      setPopupLoading(true);
      const token = authStorage.getToken() || "";
      const aptDetail = await getAppointmentDetail(token, apt);
      setSelectedAppointment(aptDetail);

      const params = new URLSearchParams(window.location.search);
      params.set('popup', 'view-appointment');
      params.set('appointment_id', apt.toString());
      router.push(`?${params.toString()}`, { scroll: false });

    } catch (err) {
      console.error("Failed to load appointment detail:", err);
      // More detailed error message with stringify
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Failed to load appointment details: ${msg} (ID: ${apt})`);
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
        await markMedicationTaken(token, Number(reminderId));

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



  return (
    <HomePageStyled>
      <div className="header-box">
        <Profile
          imageUrl={data?.profile_image}
          size={50}
          href={"/pet-owners/owner-info-page"}
        />
        <span>Hi! {data?.fname || "Pet Owner"}</span>
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
        {error && !data?.pets ? (
          <SectionError message="Could not load pets" onRetry={fetchDashboard} />
        ) : (
          <>
            <div className="pet-list">
              {data?.pets?.slice(-4).map((pet) => (
                <Profile
                  key={pet.pet_id}
                  imageUrl={pet.profile_image}
                  size={60}
                  label={pet.name}
                  showLabel={true}
                  onClick={() => router.push(`/pet-owners/my-pets-page/${pet.pet_id}`)}
                  isPet={true}
                />
              ))}
            </div>
            <NewPetButton />
          </>
        )}
      </div>

      <div className="head-section">
        <div
          className="head-right"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme.colors.textSecondary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>

          <span>Medication Reminder</span>
        </div>

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

        {error && !data?.medicines_notifications ? (
          <SectionError message="Could not load reminders" onRetry={fetchDashboard} />
        ) : (
          (() => {
            const notifications = data?.medicines_notifications || [];
            if (notifications.length === 0) {
              return (
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
              );
            }

            // Calculate status for each notification
            const processedNotifications = notifications.map(noti => {
              let timeStr = "00:00";

              // PRIORITY: Use notification_at to get the LOCAL time
              if (noti.notification_at) {
                const dateObj = new Date(noti.notification_at);
                if (!isNaN(dateObj.getTime())) {
                  // Get local hours and minutes
                  const hours = dateObj.getHours().toString().padStart(2, '0');
                  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
                  timeStr = `${hours}:${minutes}`;
                }
              }
              // Fallback to time string if notification_at fails (though it shouldn't)
              else if (noti.time) {
                timeStr = noti.time;
              }

              const computedStatus = getMedicationStatus(
                timeStr,
                noti.istaken || false,
                noti.notification_at // Pass the date string/object
              );
              return { ...noti, status: computedStatus };
            });

            const missingReminders = processedNotifications.filter(n => n.status === 'missed');
            // Show only pending reminders (exclude missed - handled above, and taken - per request)
            const otherReminders = processedNotifications.filter(n => n.status !== 'missed' && n.status !== 'taken');

            return (
              <>
                {/* Missing Reminders Section */}
                {missingReminders.length > 0 && (
                  <div style={{
                    marginBottom: 16,
                    backgroundColor: '#FEF2F2',
                    borderRadius: 12,
                    border: '1px solid #FECACA',
                    overflow: 'hidden'
                  }}>
                    <div
                      onClick={() => setShowMissingReminders(!showMissingReminders)}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: '#B91C1C',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}
                    >
                      <span>
                        You have {missingReminders.length} missing reminder{missingReminders.length > 1 ? 's' : ''}
                      </span>
                      <ArrowForwardIosIcon
                        sx={{
                          fontSize: 14,
                          transform: showMissingReminders ? 'rotate(90deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </div>

                    {showMissingReminders && (
                      <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {missingReminders.map((med_noti) => (
                          <div key={med_noti._id}>
                            <ReminderCard
                              datas={med_noti} // processedNotifications already has updated status
                              petImageSize={40}
                              onClick={() => openMedicationPopup(med_noti.notification_id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Normal Reminders */}
                {otherReminders.map((med_noti) => (
                  <div key={med_noti._id}>
                    <ReminderCard
                      datas={med_noti}
                      petImageSize={40}
                      onClick={() => openMedicationPopup(med_noti.notification_id)}
                    />
                  </div>
                ))}

                {otherReminders.length === 0 && missingReminders.length > 0 && !showMissingReminders && (
                  <div style={{ textAlign: 'center', padding: 20, color: theme.colors.textSecondary, fontSize: 13 }}>
                    No other upcoming reminders today.
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>

      {/* Medication Detail Popup */}
      {selectedNotification && (
        <MedicationDetailPopup
          page="home-page"
          noti={selectedNotification}
          onClose={closePopup}
          onToggleReminder={handleToggleReminder}
          onEdit={() => {
            // Optional: Handle edit if needed
            router.push(`/pet-owners/medication-page?popup=edit-medication&med_id=${selectedNotification.medicine_id}`);
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

      <div
        style={{
          height: 1,
          backgroundColor: theme.colors.border || "#E5E7EB",
          margin: "24px 0",
        }}
      />

      <div className="head-section">
        <div
          className="head-right"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme.colors.textSecondary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>

          Upcoming appointments
        </div>

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
        {error && !data?.appointments ? (
          <SectionError message="Could not load appointments" onRetry={fetchDashboard} />
        ) : (
          data?.appointments && data.appointments.length > 0 ? (
            data.appointments
              .filter((apt) => apt.status === "Upcoming")
              .slice(0, 3)
              .map((apt) => {
                return (
                  <AppointmentCard
                    key={apt._id}
                    datas={apt}
                    petImageSize={40}
                    onClick={() => openAppointmentPopup(Number(apt.appointment_id || apt._id))}
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
          )
        )}
      </div>

      {/* Appointment Detail Popup */}
      {selectedAppointment && (
        <AppointmentDetailPopup
          appointment={selectedAppointment}
          onClose={closePopup}
          onEdit={() => {
            router.push(`/pet-owners/calendar-page?tab=appointment&appointment_id=${selectedAppointment.appointment_id}&popup=edit-appointment`);
          }}
        />
      )}
    </HomePageStyled>
  );
}
