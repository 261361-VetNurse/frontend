"use client";

import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Page } from "@/styles/components/calendar.styled";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
} from "@/components/pet-owners/shared/CalendarModule";

import AddAppointmentPopup from "../../../shared/appointment/AddAppointmentPopup";
import { AddAppointmentPayload } from "@/types/api/appointment.dto";
import AppointmentCard from "./AppointmentCard";
import AppointmentDetail from "../../../shared/appointment/AppointmentDetail";
import EditAppointment from "../../../shared/appointment/EditAppointment";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { mockPets } from "@/mocks/pets.mock";
import { mockAppointmentsByPetId } from "@/mocks/appointments";
import { exportICS } from "@/utils/exportICS";

import { useAppointments } from "@/hooks/useAppointments";
import { Appointment } from "@/types/domain/appointment";

import {
  createAppointment,
  editAppointment,
  cancelAppointment,
  deleteAppointment,
  authStorage,
  getPets,
  getAppointmentDetail,
} from "@/services/api/client";

import SectionError from "@/components/pet-owners/shared/SectionError";
import { Pet } from "@/types";

/* ---------------- tabs ---------------- */

const appointmentTabs = [
  { name: "Appointment", path: "/appointment", params: "appointment" },
  { name: "Record", path: "/record", params: "record" },
];

/* ================= page ================= */

export default function AppointmentPage({
  selectedPetId = 0,
  allPets
}: {
  selectedPetId?: number | null;
  allPets: Pet[];
}) {
  /* -------- pets -------- */
  // Removed local petOptions and selectedPetId state

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const appointmentIdParam = searchParams.get("appointment_id");
  const popupParam = searchParams.get("popup"); // "view-appointment", "edit-appointment", "add-appointment"

  /* -------- calendar -------- */

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const selectedDateKey = dayjs(selectedDate).format("YYYY-MM-DD");

  /* -------- appointment data -------- */
  const { appointments: apiAppointments, loading: loadingApps, error, refetch } = useAppointments();

  const filteredByPet = useMemo(() => {
    if (selectedPetId === 0) return apiAppointments;
    return apiAppointments.filter((a) => a.pet_id === selectedPetId);
  }, [apiAppointments, selectedPetId]);

  const appointmentsBySelectedDate = useMemo(() => {
    return filteredByPet
      .filter((a) => {
        // Handle both ISO string and date string formats
        const d = dayjs(a.appointment_date).format("YYYY-MM-DD");
        return d === selectedDateKey;
      })
      .sort((a, b) => {
        // Sort by date and time
        const timeA = a.appointment_time || dayjs(a.appointment_date).format("HH:mm");
        const timeB = b.appointment_time || dayjs(b.appointment_date).format("HH:mm");

        const dateStrA = `${dayjs(a.appointment_date).format("YYYY-MM-DD")}T${timeA}`;
        const dateStrB = `${dayjs(b.appointment_date).format("YYYY-MM-DD")}T${timeB}`;

        return dayjs(dateStrA).unix() - dayjs(dateStrB).unix();
      });
  }, [filteredByPet, selectedDateKey]);

  /* -------- calendar markers -------- */

  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const map = new Map<string, DayMarker[]>();

    filteredByPet.forEach((a) => {
      const dateKey = dayjs(a.appointment_date).format("YYYY-MM-DD");
      const arr = map.get(dateKey) ?? [];
      arr.push({ type: "dot", colorKey: "appointment" });
      map.set(dateKey, arr);
    });

    return Array.from(map.entries()).map(([iso, markers]) => ({
      date: dayjs(iso).toDate(),
      markers,
    }));
  }, [filteredByPet]);

  /* -------- popups -------- */

  const [openCreate, setOpenCreate] = useState(false);
  const [detail, setDetail] = useState<Appointment | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);

  // Deep linking for View & Edit
  // Deep linking for View & Edit
  useEffect(() => {
    const fetchPopupData = async () => {
      const token = authStorage.getToken() || "";
      if (popupParam === "view-appointment" && appointmentIdParam) {
        try {
          // Fetch fresh detail from API
          const data = await getAppointmentDetail(token, Number(appointmentIdParam));
          setDetail(data);
        } catch (err) {
          console.error("Failed to fetch appointment detail:", err);
        }
      } else if (popupParam === "edit-appointment" && appointmentIdParam) {
        try {
          const data = await getAppointmentDetail(token, Number(appointmentIdParam));
          setEditing(data);
        } catch (err) {
          console.error("Failed to fetch appointment for edit:", err);
        }
      } else if (popupParam === "add-appointment") {
        setOpenCreate(true);
      }
    };

    if (popupParam) {
      fetchPopupData();
    }
  }, [appointmentIdParam, popupParam]);

  const openViewPopup = (appt: Appointment) => {
    // setDetail(appt); // Removed: Fetch from API via URL param
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("popup", "view-appointment");
    newParams.set("appointment_id", String(appt.appointment_id));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const openEditPopup = (appt: Appointment) => {
    // setEditing(appt); // Removed: Fetch from API via URL param
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("popup", "edit-appointment");
    newParams.set("appointment_id", String(appt.appointment_id));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const openCreatePopup = () => {
    setOpenCreate(true);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("popup", "add-appointment");
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const closePopup = () => {
    setDetail(null);
    setEditing(null);
    setOpenCreate(false);

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("popup");
    newParams.delete("appointment_id");
    // Also specific params if any
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  /* -------- handlers -------- */

  const handleCreate = async (data: AddAppointmentPayload) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await createAppointment(token, data);
      await refetch();
      closePopup();
    } catch (err) {
      console.error("Failed to create appointment:", err);
    }
  };

  const handleEdit = async (data: Appointment) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      // Canceled check
      if (data.status === "Canceled") {
        await cancelAppointment(token, data.appointment_id);
      } else {
        // Normal edit
        const payload = {
          pet_id: data.pet_id,
          appointment_date: data.appointment_date,
          location: data.location,
          status: data.status,
          note: data.note,
        };
        await editAppointment(token, data.appointment_id, payload);
      }

      await refetch();
      closePopup();
    } catch (err) {
      console.error("Failed to edit appointment:", err);
    }
  };

  const handleCancelAppointment = async (id: number) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await cancelAppointment(token, id);
      await refetch();
      closePopup();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await deleteAppointment(token, id);
      await refetch();
      setDetail(null);
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    }
  };

  return (
    <Page>
      <AddAppointmentPopup
        allPets={allPets}
        open={openCreate}
        onClose={closePopup}
        initialDate={selectedDateKey}
        initialPetId={
          selectedPetId !== 0 ? selectedPetId : undefined
        }
        onSubmit={handleCreate}
      />

      {/* Detail */}
      <AppointmentDetail
        open={!!detail}
        appointment={detail}
        onClose={closePopup}
        onEdit={(a) => {
          setDetail(null);
          openEditPopup(a);
        }}
        onDelete={handleDelete}
        onDelete={() => setDetail(null)}
        onAddToCalendar={(a) => {
          const start = dayjs(`${a.date} ${a.time}`).toDate();
          const end = dayjs(start).add(1, "hour").toDate();

          exportICS({
            title: `${a.petName} Appointment`,
            description: `Pet ID: ${a.petPid}`,
            location: a.location,
            start,
            end,
          });
        }}
      />

      {/* Edit */}
      <EditAppointment
        open={!!editing}
        appointment={editing}
        onClose={closePopup}
        onSave={handleEdit}
        onCancelAppointment={handleCancelAppointment}
      />

      {/* FAB */}
      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={openCreatePopup}
      />

      <div className="scroll-area">
        {/* Removed local PetFilterSelector */}

        <CalendarModule
          size="standard"
          weekStart="sun"
          showOutsideDays
          showMarkers
          selectedDate={selectedDate}
          month={monthCursor}
          dayMeta={dayMeta}
          maxMarkersPerDay={1}
          onSelectDate={setSelectedDate}
          onMonthChange={setMonthCursor}
          variant="card"
        />

        <div className="head-text">Upcoming appointments</div>

        {/* Error State */}
        {error ? (
          <div className="mt-4">
            <SectionError message="Failed to load appointments" onRetry={refetch} />
          </div>
        ) : (
          appointmentsBySelectedDate.length === 0 ? (
            <div className="mt-8 text-center text-gray-400 text-sm">
              No appointments on this date
            </div>
          ) : (
            <>
              <div className="date-text">
                {dayjs(selectedDate).format("ddd, DD/MM/YYYY")}
              </div>
              <div className="line" />

              {appointmentsBySelectedDate.map((a) => (
                <AppointmentCard
                  key={a.appointment_id}
                  appointment={a}
                  onClick={() => openViewPopup(a)}
                />
              ))}
            </>
          )
        )}
      </div>
    </Page>
  );
}
