"use client";

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";

import { Pet } from "@/types/domain/pet";

import {
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
} from "@/components/pet-owners/shared/CalendarModule";

// แก้ไข Path การ Import ให้เรียกใช้ไฟล์ในโฟลเดอร์เดียวกัน
import AddAppointmentPopup, { AddAppointmentPayload } from "./AddAppointmentPopup";
import AppointmentCard from "@/components/pet-owners/shared/appointment/AppointmentCard";
import AppointmentDetail, {
  type AppointmentDetailItem,
} from "@/components/pet-owners/shared/appointment/AppointmentDetail";
import EditAppointment from "@/components/pet-owners/shared/appointment/EditAppointment";

import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { mockPets } from "@/mocks/pets.mock";
import { mockAppointmentsByPetId } from "@/mocks/appointments";

// Simplified type for pet selector options
type PetOption = {
  id: string;
  name: string;
  pid: string;
  avatarUrl: string;
};

/* ---------------- tabs ---------------- */

const appointmentTabs = [
  { name: "Appointment", path: "/appointment", params: "appointment" },
  { name: "Record", path: "/record", params: "record" },
];

/* ---------------- styled ---------------- */

const Page = styled.div`
  width: 100%;
  min-height: 100vh;

  .scroll-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 80px;
  }

  .head-text {
    font-size: 18px;
    font-weight: 500;
  }

  .date-text {
    font-size: 14px;
    font-weight: 500;
  }

  .line {
    width: 100%;
    height: 1px;
    background: rgba(0, 0, 0, 0.15);
  }
`;

/* ================= page ================= */

export default function AppointmentPage({
  selectedPetId = "all",
}: {
  selectedPetId?: PetSelectorValue;
}) {
  /* -------- pets -------- */
  // Removed local petOptions and selectedPetId state

  /* -------- calendar -------- */

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const selectedDateKey = dayjs(selectedDate).format("YYYY-MM-DD");

  /* -------- appointment data -------- */

  const appointments: AppointmentDetailItem[] = useMemo(() => {
    return Object.values(mockAppointmentsByPetId)
      .flat()
      .map((item) => {
        const pet = mockPets.find(
          (p) => String(p._id) === String(item.petId)
        );

        return {
          id: item.id,
          petId: String(item.petId),
          petName: item.petName,
          petPid: pet ? String(pet._id) : "-",
          avatarUrl: pet?.profile_image,
          date: item.date,
          time: item.time,
          location: item.location,
          status: item.status,
        };
      });
  }, []);

  const filteredByPet = useMemo(() => {
    if (selectedPetId === "all") return appointments;
    return appointments.filter((a) => a.petId === selectedPetId);
  }, [appointments, selectedPetId]);

  const appointmentsBySelectedDate = useMemo(() => {
    return filteredByPet
      .filter((a) => a.date === selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredByPet, selectedDateKey]);

  /* -------- calendar markers -------- */

  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const map = new Map<string, DayMarker[]>();

    filteredByPet.forEach((a) => {
      const arr = map.get(a.date) ?? [];
      arr.push({ type: "dot", colorKey: "appointment" });
      map.set(a.date, arr);
    });

    return Array.from(map.entries()).map(([iso, markers]) => ({
      date: dayjs(iso).toDate(),
      markers,
    }));
  }, [filteredByPet]);

  /* -------- popups -------- */

  const [openCreate, setOpenCreate] = useState(false);
  const [detail, setDetail] =
    useState<AppointmentDetailItem | null>(null);
  const [editing, setEditing] =
    useState<AppointmentDetailItem | null>(null);

  // Re-creating petOptions for popup usage since we removed the main one
  const petOptions: PetOption[] = useMemo(
    () =>
      mockPets.map((p: Pet) => ({
        id: String(p._id),
        name: p.name,
        pid: String(p._id),
        avatarUrl: p.profile_image,
      })),
    []
  );

  /* ================= render ================= */

  return (
    <Page>
      <AddAppointmentPopup
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        pets={petOptions}
        initialDate={selectedDateKey}
        initialPetId={
          selectedPetId !== "all" ? selectedPetId : undefined
        }
        onSubmit={(data: AddAppointmentPayload) => {
          console.log("บันทึกนัดหมาย:", data);
          setOpenCreate(false);
        }}
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
        onDelete={() => setDetail(null)}
      />

      {/* Edit */}
      <EditAppointment
        open={!!editing}
        appointment={editing}
        onClose={() => setEditing(null)}
        onSave={() => setEditing(null)}
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

        {appointmentsBySelectedDate.length === 0 ? (
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
                key={a.id}
                petName={a.petName}
                time={a.time}
                location={a.location}
                avatarUrl={a.avatarUrl}
                onClick={() => setDetail(a)}
              />
            ))}
          </>
        )}
      </div>
    </Page>
  );
}