"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import styled from "styled-components";

import { Tabs } from "@/components/pet-owners/shared/Tabs";
import PetFilterSelector, {
  type PetLite,
  type PetSelectorValue,
} from "@/components/pet-owners/shared/PetFilterSelector";

import CalendarModule, {
  type CalendarDayMeta,
  type DayMarker,
} from "@/components/pet-owners/shared/CalendarModule";

import AppointmentCard from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentCard";
import { QuickDialButton } from "@/components/pet-owners/shared/QuickDialButton";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { PopUp } from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPopup";
import AppointmentPopDone from "@/components/pet-owners/MainPage/CalendarPage/appointment/AppointmentPopDone";

import { mockPets } from "@/mocks/pets.mock";
import { mockAppointmentsByPetId } from "@/mocks/appointments";
import { Pet } from "@/types/pet";

type Appointment = {
  dateKey: string; // YYYY-MM-DD
  pet: string;
  petId?: string;
  time: string;
  location: string;
  status?: string;
  petImage?: string;
  pid?: string;
};

const appointmentTabs = [
  { name: "Appointment", path: "/appointment", params: "appointment" },
  { name: "Record", path: "/record", params: "record" },
];

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

export const AppointmentPage = () => {
  /** ================= state ================= */

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return Object.values(mockAppointmentsByPetId)
      .flat()
      .map((item) => {
        const pet = mockPets.find(
          (p) => String(p._id) === String(item.petId)
        );

        return {
          dateKey: item.date,
          pet: item.petName,
          petId: item.petId,
          time: item.time,
          location: item.location,
          status: item.status,
          petImage: pet?.profile_image,
          pid: pet ? String(pet._id) : undefined,
        };
      });
  });

  const [selectedPetId, setSelectedPetId] =
    useState<PetSelectorValue>("all");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthCursor, setMonthCursor] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  /** ================= derived ================= */

  const selectedDateKey = dayjs(selectedDate).format("YYYY-MM-DD");

  const petOptions: PetLite[] = useMemo(
    () =>
      mockPets.map((p: Pet) => ({
        id: String(p._id),
        name: p.name,
        pid: String(p._id),
        avatarUrl: p.profile_image,
      })),
    []
  );

  const filteredAppointments = useMemo(() => {
    if (selectedPetId === "all") return appointments;
    return appointments.filter(
      (a) => a.petId === selectedPetId || a.pet === selectedPetId
    );
  }, [appointments, selectedPetId]);

  /** 👉 appointments ของ “วันที่เลือกเท่านั้น” */
  const appointmentsBySelectedDate = useMemo(() => {
    return filteredAppointments
      .filter((a) => a.dateKey === selectedDateKey)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [filteredAppointments, selectedDateKey]);

  /** dot marker บน calendar */
  const dayMeta: CalendarDayMeta[] = useMemo(() => {
    const map = new Map<string, DayMarker[]>();

    filteredAppointments.forEach((a) => {
      const arr = map.get(a.dateKey) ?? [];
      arr.push({ type: "dot", colorKey: "appointment" });
      map.set(a.dateKey, arr);
    });

    return Array.from(map.entries()).map(([iso, markers]) => ({
      date: dayjs(iso).toDate(),
      markers,
    }));
  }, [filteredAppointments]);

  /** ================= render ================= */

  return (
    <Page>
      {/* create / edit popup */}
      <PopUp
        open={isPopUpOpen}
        onOpenChange={setIsPopUpOpen}
        onCreateAppointment={() => {}}
        initialValues={undefined}
        isEditing={Boolean(editingAppointment)}
      />

      {/* detail popup */}
      <AppointmentPopDone
        open={isDetailOpen}
        appointment={selectedAppointment || undefined}
        onClose={() => setIsDetailOpen(false)}
        onDelete={(appt) =>
          setAppointments((prev) =>
            prev.filter((a) => a !== appt)
          )
        }
        onEdit={(appt) => {
          setEditingAppointment(appt);
          setIsDetailOpen(false);
          setIsPopUpOpen(true);
        }}
      />

      <QuickDialButton
        iconColor="#fff"
        position="bottom-right"
        icon={<AddRoundedIcon />}
        color="#09BFF8"
        onClickAction={() => {
          setEditingAppointment(null);
          setIsPopUpOpen(true);
        }}
      />

      <div className="scroll-area">
        <Tabs data={appointmentTabs} queryKey="tab" />

        <PetFilterSelector
          mode="filter"
          allowAllPets
          pets={petOptions}
          value={selectedPetId}
          onChange={setSelectedPetId}
          placeholder="Select your pet"
        />

        {/* ✅ Calendar ผูก state จริง */}
        <CalendarModule
          size="standard"
          weekStart="sun"
          showOutsideDays
          showMarkers
          selectedDate={selectedDate}
          month={monthCursor}
          dayMeta={dayMeta}
          maxMarkersPerDay={3}
          onSelectDate={(d) => setSelectedDate(d)}
          onMonthChange={(m) => setMonthCursor(m)}
        />

        <div className="head-text">Upcoming appointments</div>

        {/* ✅ list เฉพาะวันที่เลือก */}
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

            {appointmentsBySelectedDate.map((a, i) => (
              <AppointmentCard
                key={`${a.dateKey}-${i}`}
                petName={a.pet}
                date={dayjs(a.dateKey).format("DD/MM/YYYY")}
                time={a.time}
                location={a.location}
                onClick={() => {
                  setSelectedAppointment(a);
                  setIsDetailOpen(true);
                }}
              />
            ))}
          </>
        )}
      </div>
    </Page>
  );
};
