"use client";

import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { useSearchParams, useRouter } from "next/navigation";

import { Page } from "@/styles/components/calendar.styled";

import {
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
} from "@/components/pet-owners/shared/CalendarModule";

import AddAppointmentPopup, { AddAppointmentPayload } from "../../../shared/appointment/AddAppointmentPopup";
import AppointmentCard from "./AppointmentCard";
import AppointmentDetail from "../../../shared/appointment/AppointmentDetail";
import EditAppointment, { EditAppointmentPayload } from "../../../shared/appointment/EditAppointment";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useAppointments } from "@/hooks/useAppointments";
import { Appointment } from "@/types/domain/appointment";

import {
  createAppointment,
  editAppointment,
  cancelAppointment,
  deleteAppointment,
  authStorage,
} from "@/services/api/client";

import SectionError from "@/components/pet-owners/shared/SectionError";

/* ---------------- tabs ---------------- */

const appointmentTabs = [
  { name: "Appointment", path: "/appointment", params: "appointment" },
  { name: "Record", path: "/record", params: "record" },
];

/* ================= page ================= */

export default function AppointmentPage({
  selectedPetId = "all",
}: {
  selectedPetId?: PetSelectorValue;
}) {
  /* -------- pets -------- */
  // Removed local petOptions and selectedPetId state

  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentIdParam = searchParams.get("appointment_id");
  const openParam = searchParams.get("open");

  /* -------- calendar -------- */

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const selectedDateKey = dayjs(selectedDate).format("YYYY-MM-DD");

  /* -------- appointment data -------- */
  const { appointments: apiAppointments, loading: loadingApps, error, refetch } = useAppointments();

  const filteredByPet = useMemo(() => {
    if (selectedPetId === "all") return apiAppointments;
    return apiAppointments.filter((a) => a.pet_id === selectedPetId);
  }, [apiAppointments, selectedPetId]);

  const appointmentsBySelectedDate = useMemo(() => {
    return filteredByPet
      .filter((a) => {
        const d = dayjs(a.appointment_date).format("YYYY-MM-DD");
        return d === selectedDateKey;
      })
      .sort((a, b) => {
        // compare time
        const tA = dayjs(a.appointment_date).unix();
        const tB = dayjs(b.appointment_date).unix();
        return tA - tB;
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
  const [detail, setDetail] =
    useState<Appointment | null>(null);
  const [editing, setEditing] =
    useState<Appointment | null>(null);

  // Deep linking for Edit
  useEffect(() => {
    if (appointmentIdParam && openParam === "edit" && !loadingApps && apiAppointments.length > 0) {
      const target = apiAppointments.find((a) => a._id === appointmentIdParam);
      if (target) {
        setEditing(target);
      }
    }
  }, [appointmentIdParam, openParam, loadingApps, apiAppointments]);

  const closeEdit = () => {
    setEditing(null);
    // Clear query params
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("appointment_id");
    newParams.delete("open");
    router.replace(`?${newParams.toString()}`);
  };

  /* -------- handlers -------- */

  const handleCreate = async (data: AddAppointmentPayload) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      // Construct payload
      // Backend expects: { pet_id, appointment_date (ISO), location, status? }
      const dateTime = dayjs(`${data.date}T${data.time}`).toISOString();

      const payload = {
        pet_id: data.petId,
        appointment_date: dateTime,
        location: data.location,
        status: "Upcoming", // default
      };

      await createAppointment(token, payload);
      await refetch();
      setOpenCreate(false);
    } catch (err) {
      console.error("Failed to create appointment:", err);
      // You might want to show a toast/alert here
    }
  };

  const handleEdit = async (data: EditAppointmentPayload) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      // Canceled check
      if (data.status === "Canceled") {
        await cancelAppointment(token, data.id);
      } else {
        // Normal edit
        const dateTime = dayjs(`${data.date}T${data.time}`).toISOString();
        const payload = {
          pet_id: data.petId,
          appointment_date: dateTime,
          location: data.location,
          status: data.status,
        };
        await editAppointment(token, data.id, payload);
      }

      await refetch();
      closeEdit();
    } catch (err) {
      console.error("Failed to edit appointment:", err);
      // alert
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await cancelAppointment(token, id);
      await refetch();
      closeEdit();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    try {
      const token = authStorage.getToken();
      if (!token) throw new Error("No token found");

      await deleteAppointment(token, id);
      await refetch();
      setDetail(null);
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      // alert
    }
  };

  return (
    <Page>
      <AddAppointmentPopup
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        initialDate={selectedDateKey}
        initialPetId={
          selectedPetId !== "all" ? selectedPetId : undefined
        }
        onSubmit={handleCreate}
      />

      {/* Detail */}
      <AppointmentDetail
        open={!!detail}
        appointment={detail}
        onClose={() => setDetail(null)}
        onEdit={(a) => {
          setDetail(null);
          setEditing(a);
        }}
        onDelete={handleDelete}
      />

      {/* Edit */}
      <EditAppointment
        open={!!editing}
        appointment={editing}
        onClose={closeEdit}
        onSave={handleEdit}
        onCancelAppointment={handleCancelAppointment}
      />

      {/* FAB */}
      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={() => setOpenCreate(true)}
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
                  key={a._id}
                  appointment={a}
                  onClick={() => setDetail(a)}
                />
              ))}
            </>
          )
        )}
      </div>
    </Page>
  );
}